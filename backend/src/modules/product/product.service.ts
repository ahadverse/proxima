import type { FilterQuery, SortOrder } from 'mongoose';
import type { ProductInput, ProductQuery, ProductStatus, SortOption } from '@/shared';
import { runInBackground } from '../../lib/background';
import { CacheTags, revalidateStorefront } from '../../lib/revalidate';
import { ApiError } from '../../utils/ApiError';
import { cleanLocalizedHtml } from '../../utils/html';
import { buildMeta, containsRegex, toSkip } from '../../utils/pagination';
import { Category } from '../category/category.model';
import { syncProductCounts } from '../category/category.service';
import { Order } from '../order/order.model';
import { toAdminDTO, toCardDTO, toDetailDTO } from './product.mapper';
import {
  CARD_FIELDS,
  CATEGORY_POPULATE,
  DETAIL_FIELDS,
  Product,
  type IProduct,
} from './product.model';
import type { AdminProductListQuery } from './product.validation';

const PUBLIC_SORTS: Record<SortOption, Record<string, SortOrder>> = {
  default: { createdAt: -1 },
  featured: { featured: -1, order: 1, createdAt: -1 },
  popular: { sales: -1, views: -1, createdAt: -1 },
  latest: { createdAt: -1 },
  'price-asc': { price: 1, createdAt: -1 },
  'price-desc': { price: -1, createdAt: -1 },
};

const ADMIN_SORTS: Record<AdminProductListQuery['sort'], Record<string, SortOrder>> = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  sales: { sales: -1 },
  views: { views: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  order: { featured: -1, order: 1, createdAt: -1 },
};

const publishedCatalog = (): FilterQuery<IProduct> => ({ status: 'published', type: { $ne: 'membership' } });

/* --------------------------------- Public --------------------------------- */

export async function listPublic(query: ProductQuery) {
  const filter = publishedCatalog();

  if (query.category) {
    const category = await Category.findOne({ slug: query.category, isActive: true }).select('_id').lean();
    if (!category) return { items: [], meta: buildMeta(0, query.page, query.limit) };
    filter.category = category._id;
  }
  if (query.type && query.type !== 'membership') filter.type = query.type;
  if (query.q) {
    const regex = containsRegex(query.q);
    filter.$or = [{ 'title.en': regex }, { 'title.bn': regex }, { techTags: regex }];
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .select(CARD_FIELDS)
      .populate(CATEGORY_POPULATE)
      .sort(PUBLIC_SORTS[query.sort])
      .skip(toSkip(query.page, query.limit))
      .limit(query.limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items: items.map(toCardDTO), meta: buildMeta(total, query.page, query.limit) };
}

export async function suggest(q: string) {
  const regex = containsRegex(q);
  const items = await Product.find({ ...publishedCatalog(), $or: [{ 'title.en': regex }, { 'title.bn': regex }, { techTags: regex }] })
    .select('slug title thumbnail price isFree category')
    .populate(CATEGORY_POPULATE)
    .sort({ sales: -1, views: -1 })
    .limit(6)
    .lean();
  return items.map((item) => {
    const card = toCardDTO(item);
    return {
      _id: card._id,
      slug: card.slug,
      title: card.title,
      thumbnail: card.thumbnail,
      price: card.price,
      isFree: card.isFree,
      category: card.category,
    };
  });
}

export async function getPublicBySlug(slug: string) {
  const product = await Product.findOne({ slug, status: 'published' })
    .select(DETAIL_FIELDS)
    .populate(CATEGORY_POPULATE)
    .lean();
  if (!product) throw ApiError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
  return toDetailDTO(product);
}

export async function related(slug: string) {
  const product = await Product.findOne({ slug, status: 'published' }).select('_id category type').lean();
  if (!product) throw ApiError.notFound('Product not found', 'PRODUCT_NOT_FOUND');

  const base = { ...publishedCatalog(), _id: { $ne: product._id } };
  let items = await Product.find({ ...base, category: product.category })
    .select(CARD_FIELDS)
    .populate(CATEGORY_POPULATE)
    .sort({ featured: -1, sales: -1 })
    .limit(4)
    .lean();

  if (items.length < 4) {
    const extra = await Product.find({ ...base, _id: { $nin: [product._id, ...items.map((i) => i._id)] } })
      .select(CARD_FIELDS)
      .populate(CATEGORY_POPULATE)
      .sort({ sales: -1, createdAt: -1 })
      .limit(4 - items.length)
      .lean();
    items = [...items, ...extra];
  }
  return items.map(toCardDTO);
}

export async function registerView(slug: string) {
  await Product.updateOne({ slug, status: 'published' }, { $inc: { views: 1 } });
}

export async function getMembership() {
  const product = await Product.findOne({ type: 'membership', status: 'published' })
    .select(DETAIL_FIELDS)
    .sort({ createdAt: 1 })
    .lean();
  const [websites, plugins, featured] = await Promise.all([
    Product.countDocuments({ status: 'published', type: 'website' }),
    Product.countDocuments({ status: 'published', type: 'plugin' }),
    Product.find(publishedCatalog())
      .select(CARD_FIELDS)
      .populate(CATEGORY_POPULATE)
      .sort({ featured: -1, sales: -1, createdAt: -1 })
      .limit(8)
      .lean(),
  ]);
  return {
    product: product ? toDetailDTO(product) : null,
    counts: { websites, plugins },
    featured: featured.map(toCardDTO),
  };
}

/* ---------------------------------- Admin --------------------------------- */

const ADMIN_FIELDS = `${DETAIL_FIELDS} status order +githubUrl +file`;

export async function adminList(query: AdminProductListQuery) {
  const filter: FilterQuery<IProduct> = {};
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  if (query.q) {
    const regex = containsRegex(query.q);
    filter.$or = [{ 'title.en': regex }, { 'title.bn': regex }, { slug: regex }];
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .select(ADMIN_FIELDS)
      .populate(CATEGORY_POPULATE)
      .sort(ADMIN_SORTS[query.sort])
      .skip(toSkip(query.page, query.limit))
      .limit(query.limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { items: items.map(toAdminDTO), meta: buildMeta(total, query.page, query.limit) };
}

export async function adminGet(id: string) {
  const product = await Product.findById(id).select(ADMIN_FIELDS).populate(CATEGORY_POPULATE).lean();
  if (!product) throw ApiError.notFound('Product not found');
  return toAdminDTO(product);
}

async function normalizeInput(input: ProductInput) {
  return {
    ...input,
    price: input.isFree ? 0 : input.price,
    compareAtPrice: input.isFree ? null : input.compareAtPrice,
    category: input.type === 'membership' ? input.category ?? null : input.category,
    description: await cleanLocalizedHtml(input.description),
    techTags: [...new Set(input.techTags)],
    changelog: input.changelog.map((entry) => ({ ...entry, date: new Date(entry.date) })),
  };
}

function afterProductChange(slugs: string[]) {
  // Refresh category counts first so the storefront never re-caches stale numbers.
  const sync = syncProductCounts().finally(() =>
    revalidateStorefront([CacheTags.products, CacheTags.categories, ...slugs.map(CacheTags.product)]),
  );
  runInBackground(sync, 'Category count sync');
}

export async function create(input: ProductInput) {
  const product = await Product.create(await normalizeInput(input));
  afterProductChange([product.slug]);
  return adminGet(String(product._id));
}

export async function update(id: string, input: ProductInput) {
  const existing = await Product.findById(id).select('slug').lean();
  if (!existing) throw ApiError.notFound('Product not found');
  await Product.updateOne({ _id: id }, { $set: await normalizeInput(input) }, { runValidators: true });
  afterProductChange([existing.slug, input.slug]);
  return adminGet(id);
}

export async function setStatus(id: string, status: ProductStatus) {
  const product = await Product.findByIdAndUpdate(id, { $set: { status } }, { new: true }).select('slug').lean();
  if (!product) throw ApiError.notFound('Product not found');
  afterProductChange([product.slug]);
  return adminGet(id);
}

export async function remove(id: string) {
  const hasOrders = await Order.exists({ 'items.product': id });
  if (hasOrders) {
    throw ApiError.conflict(
      'This product has orders and cannot be deleted. Set it to draft to hide it instead.',
      'PRODUCT_HAS_ORDERS',
    );
  }
  const product = await Product.findByIdAndDelete(id).select('slug').lean();
  if (!product) throw ApiError.notFound('Product not found');
  afterProductChange([product.slug]);
}
