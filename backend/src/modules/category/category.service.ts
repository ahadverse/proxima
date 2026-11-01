import type { CategoryInput } from '@/shared';
import { CacheTags, revalidateStorefront } from '../../lib/revalidate';
import { ApiError } from '../../utils/ApiError';
import { Product } from '../product/product.model';
import { Category, toCategoryDTO } from './category.model';

export async function listPublic() {
  const categories = await Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
  return categories.map(toCategoryDTO);
}

export async function listAll() {
  const categories = await Category.find().sort({ order: 1, createdAt: 1 }).lean();
  return categories.map(toCategoryDTO);
}

export async function create(input: CategoryInput) {
  const last = await Category.findOne().sort({ order: -1 }).select('order').lean();
  const category = await Category.create({ ...input, order: (last?.order ?? -1) + 1 });
  revalidateStorefront([CacheTags.categories]);
  return toCategoryDTO(category);
}

export async function update(id: string, input: CategoryInput) {
  const category = await Category.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true }).lean();
  if (!category) throw ApiError.notFound('Category not found');
  revalidateStorefront([CacheTags.categories, CacheTags.products]);
  return toCategoryDTO(category);
}

export async function remove(id: string) {
  const inUse = await Product.exists({ category: id });
  if (inUse) {
    throw ApiError.conflict('Move or delete the products in this category first', 'CATEGORY_IN_USE');
  }
  const deleted = await Category.findByIdAndDelete(id).lean();
  if (!deleted) throw ApiError.notFound('Category not found');
  revalidateStorefront([CacheTags.categories]);
}

export async function reorder(ids: string[]) {
  await Category.bulkWrite(
    ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } })),
  );
  revalidateStorefront([CacheTags.categories]);
  return listAll();
}

/** Recomputes the published product count shown next to each category. */
export async function syncProductCounts() {
  const counts = await Product.aggregate<{ _id: unknown; count: number }>([
    { $match: { status: 'published', type: { $ne: 'membership' }, category: { $ne: null } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.count]));
  const categories = await Category.find().select('_id productCount').lean();
  const ops = categories
    .filter((c) => (byId.get(String(c._id)) ?? 0) !== c.productCount)
    .map((c) => ({
      updateOne: { filter: { _id: c._id }, update: { $set: { productCount: byId.get(String(c._id)) ?? 0 } } },
    }));
  if (ops.length) await Category.bulkWrite(ops);
}
