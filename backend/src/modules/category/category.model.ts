import { Schema, model, type Types } from 'mongoose';
import type { Localized } from '@/shared';
import { localizedSchema } from '../shared/localized.schema';

export interface ICategory {
  _id: Types.ObjectId;
  name: Localized;
  slug: string;
  icon: string;
  order: number;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: localizedSchema, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    productCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Category = model<ICategory>('Category', categorySchema);

export function toCategoryDTO(category: ICategory) {
  return {
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    order: category.order,
    productCount: category.productCount,
    isActive: category.isActive,
  };
}
