import { Schema, model, type Types } from 'mongoose';
import type { Localized, PageDTO } from '@/shared';
import { localizedSchema } from '../shared/localized.schema';

export interface IPage {
  _id: Types.ObjectId;
  slug: string;
  title: Localized;
  content: Localized;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<IPage>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: localizedSchema, required: true },
    content: { type: localizedSchema, default: () => ({}) },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Page = model<IPage>('Page', pageSchema);

export function toPageDTO(page: IPage): PageDTO {
  return {
    _id: String(page._id),
    slug: page.slug,
    title: page.title,
    content: page.content,
    isPublished: page.isPublished,
    updatedAt: page.updatedAt.toISOString(),
  };
}
