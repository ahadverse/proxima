import { Schema, model, type Types } from 'mongoose';
import type { Localized, VideoReviewDTO } from '@/shared';
import { localizedSchema } from '../shared/localized.schema';

export interface IVideoReview {
  _id: Types.ObjectId;
  youtubeId: string;
  url: string;
  title: Localized;
  description: Localized;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const videoReviewSchema = new Schema<IVideoReview>(
  {
    youtubeId: { type: String, required: true },
    url: { type: String, required: true },
    title: { type: localizedSchema, required: true },
    description: { type: localizedSchema, default: () => ({}) },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const VideoReview = model<IVideoReview>('VideoReview', videoReviewSchema);

export function toVideoReviewDTO(review: IVideoReview): VideoReviewDTO {
  return {
    _id: String(review._id),
    youtubeId: review.youtubeId,
    url: review.url,
    title: review.title,
    description: review.description,
    order: review.order,
    isActive: review.isActive,
  };
}
