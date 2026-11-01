import { Schema, model, type Types } from 'mongoose';
import {
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  TECH_STACKS,
  type Localized,
  type ProductStatus,
  type ProductType,
  type TechStack,
} from '@/shared';
import { localizedSchema } from '../shared/localized.schema';

export interface IProduct {
  _id: Types.ObjectId;
  type: ProductType;
  status: ProductStatus;
  slug: string;
  category: Types.ObjectId | null;
  title: Localized;
  shortDescription: Localized;
  description: Localized;
  techStack: TechStack;
  techTags: string[];
  price: number;
  compareAtPrice: number | null;
  isFree: boolean;
  thumbnail: string;
  gallery: string[];
  previewUrl: string;
  tutorialUrl: string;
  githubUrl: string;
  demoAdmin: { url: string; email: string; password: string; isPublic: boolean };
  file: { key: string; name: string; size: number } | null;
  version: string;
  highlights: Localized[];
  features: Localized[];
  changelog: { version: string; date: Date; notes: Localized }[];
  seo: { title: string; description: string };
  featured: boolean;
  order: number;
  views: number;
  sales: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    type: { type: String, enum: PRODUCT_TYPES, required: true, default: 'website' },
    status: { type: String, enum: PRODUCT_STATUSES, default: 'draft' },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    title: { type: localizedSchema, required: true },
    shortDescription: { type: localizedSchema, default: () => ({}) },
    description: { type: localizedSchema, default: () => ({}) },
    techStack: { type: String, enum: TECH_STACKS, default: 'nextjs' },
    techTags: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    isFree: { type: Boolean, default: false },
    thumbnail: { type: String, required: true },
    gallery: { type: [String], default: [] },
    previewUrl: { type: String, default: '' },
    tutorialUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '', select: false },
    demoAdmin: {
      type: new Schema(
        {
          url: { type: String, default: '' },
          email: { type: String, default: '' },
          password: { type: String, default: '' },
          isPublic: { type: Boolean, default: false },
        },
        { _id: false },
      ),
      default: () => ({}),
      select: false,
    },
    file: {
      type: new Schema(
        { key: { type: String, required: true }, name: { type: String, required: true }, size: { type: Number, default: 0 } },
        { _id: false },
      ),
      default: null,
      select: false,
    },
    version: { type: String, default: '1.0.0' },
    highlights: { type: [localizedSchema], default: [] },
    features: { type: [localizedSchema], default: [] },
    changelog: {
      type: [
        new Schema(
          { version: { type: String, required: true }, date: { type: Date, required: true }, notes: { type: localizedSchema, default: () => ({}) } },
          { _id: false },
        ),
      ],
      default: [],
    },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
    },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({ status: 1, type: 1, category: 1 });
productSchema.index({ status: 1, featured: -1, order: 1, createdAt: -1 });
productSchema.index({ status: 1, sales: -1, views: -1 });
productSchema.index({ status: 1, price: 1 });

export const Product = model<IProduct>('Product', productSchema);

export const CARD_FIELDS =
  'slug type title shortDescription category techStack price compareAtPrice isFree thumbnail previewUrl views sales ratingAvg ratingCount featured createdAt updatedAt';

export const DETAIL_FIELDS = `${CARD_FIELDS} description gallery tutorialUrl techTags highlights features changelog version seo +demoAdmin`;

export const CATEGORY_POPULATE = { path: 'category', select: 'name slug' } as const;
