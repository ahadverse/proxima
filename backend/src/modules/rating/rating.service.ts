import { Types, type FilterQuery } from 'mongoose';
import type { ProductRatingsDTO, RatingInput, RatingStatus, RatingSummaryDTO } from '@/shared';
import { CacheTags, revalidateStorefront } from '../../lib/revalidate';
import { ApiError } from '../../utils/ApiError';
import { buildMeta, toSkip } from '../../utils/pagination';
import { canAccess } from '../library/entitlement.service';
import { Product } from '../product/product.model';
import { Rating, toRatingDTO, type IRating } from './rating.model';
import type { AdminRatingListQuery } from './rating.validation';

const PAGE_SIZE = 6;

async function summarize(productId: Types.ObjectId): Promise<RatingSummaryDTO> {
  const rows = await Rating.aggregate<{ _id: number; count: number }>([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: '$stars', count: { $sum: 1 } } },
  ]);
  const distribution: RatingSummaryDTO['distribution'] = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  let count = 0;
  let total = 0;
  for (const row of rows) {
    distribution[String(row._id) as keyof typeof distribution] = row.count;
    count += row.count;
    total += row._id * row.count;
  }
  return { avg: count ? Math.round((total / count) * 10) / 10 : 0, count, distribution };
}

async function recalculate(productId: Types.ObjectId) {
  const summary = await summarize(productId);
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: { ratingAvg: summary.avg, ratingCount: summary.count } },
    { new: true },
  )
    .select('slug')
    .lean();
  if (product) revalidateStorefront([CacheTags.product(product.slug), CacheTags.products, CacheTags.ratings]);
}

async function findPublishedProduct(slug: string) {
  const product = await Product.findOne({ slug, status: 'published' }).select('_id type status slug').lean();
  if (!product) throw ApiError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
  return product;
}

export async function listForProduct(slug: string, page: number, userId?: string): Promise<ProductRatingsDTO & { meta: ReturnType<typeof buildMeta> }> {
  const product = await findPublishedProduct(slug);
  const filter = { product: product._id, status: 'approved' as const };

  const [summary, items, total, mine, entitled] = await Promise.all([
    summarize(product._id),
    Rating.find(filter).populate('user', 'name').sort({ createdAt: -1 }).skip(toSkip(page, PAGE_SIZE)).limit(PAGE_SIZE).lean(),
    Rating.countDocuments(filter),
    userId ? Rating.findOne({ product: product._id, user: userId }).populate('user', 'name').lean() : null,
    userId ? canAccess(userId, product) : false,
  ]);

  return {
    summary,
    items: items.map(toRatingDTO),
    mine: mine ? toRatingDTO(mine) : null,
    canRate: Boolean(entitled),
    meta: buildMeta(total, page, PAGE_SIZE),
  };
}

export async function upsert(slug: string, userId: string, input: RatingInput) {
  const product = await findPublishedProduct(slug);
  const allowed = await canAccess(userId, product);
  if (!allowed) throw ApiError.forbidden('Only customers who own this product can rate it', 'NOT_ENTITLED');

  const rating = await Rating.findOneAndUpdate(
    { product: product._id, user: userId },
    { $set: { stars: input.stars, comment: input.comment }, $setOnInsert: { status: 'approved' } },
    { upsert: true, new: true },
  )
    .populate('user', 'name')
    .lean();
  await recalculate(product._id);
  return toRatingDTO(rating!);
}

export async function latest(limit = 12) {
  const items = await Rating.find({ status: 'approved', comment: { $ne: '' } })
    .populate('user', 'name')
    .populate('product', 'slug title thumbnail')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return items.map(toRatingDTO);
}

/* ---------------------------------- Admin --------------------------------- */

export async function adminList(query: AdminRatingListQuery) {
  const filter: FilterQuery<IRating> = {};
  if (query.status) filter.status = query.status;
  if (query.product) filter.product = new Types.ObjectId(query.product);
  const [items, total] = await Promise.all([
    Rating.find(filter)
      .populate('user', 'name')
      .populate('product', 'slug title thumbnail')
      .sort({ createdAt: -1 })
      .skip(toSkip(query.page, query.limit))
      .limit(query.limit)
      .lean(),
    Rating.countDocuments(filter),
  ]);
  return { items: items.map(toRatingDTO), meta: buildMeta(total, query.page, query.limit) };
}

export async function adminSetStatus(id: string, status: RatingStatus) {
  const rating = await Rating.findByIdAndUpdate(id, { $set: { status } }, { new: true })
    .populate('user', 'name')
    .populate('product', 'slug title thumbnail')
    .lean();
  if (!rating) throw ApiError.notFound('Rating not found');
  await recalculate((rating.product as unknown as { _id: Types.ObjectId })._id);
  return toRatingDTO(rating);
}

export async function adminRemove(id: string) {
  const rating = await Rating.findByIdAndDelete(id).lean();
  if (!rating) throw ApiError.notFound('Rating not found');
  await recalculate(rating.product);
}
