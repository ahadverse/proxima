import { Schema, model, type Types } from 'mongoose';
import { RATING_STATUSES, type Localized, type RatingDTO, type RatingStatus } from '@/shared';

export interface IRating {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  stars: number;
  comment: string;
  status: RatingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true, maxlength: 1000 },
    status: { type: String, enum: RATING_STATUSES, default: 'approved' },
  },
  { timestamps: true },
);

ratingSchema.index({ product: 1, user: 1 }, { unique: true });
ratingSchema.index({ product: 1, status: 1, createdAt: -1 });
ratingSchema.index({ status: 1, createdAt: -1 });

export const Rating = model<IRating>('Rating', ratingSchema);

type RatingDoc = Omit<IRating, 'user' | 'product'> & { user: unknown; product: unknown };

export function toRatingDTO(rating: RatingDoc): RatingDTO {
  const user = rating.user as { _id: unknown; name?: string } | null;
  const product = rating.product as { _id: unknown; slug?: string; title?: Localized; thumbnail?: string } | null;
  return {
    _id: String(rating._id),
    stars: rating.stars,
    comment: rating.comment,
    status: rating.status,
    user: user && typeof user === 'object' && 'name' in user ? { _id: String(user._id), name: user.name ?? '' } : null,
    product:
      product && typeof product === 'object' && 'slug' in product
        ? { _id: String(product._id), slug: product.slug ?? '', title: product.title ?? { en: '', bn: '' }, thumbnail: product.thumbnail ?? '' }
        : null,
    createdAt: rating.createdAt.toISOString(),
    updatedAt: rating.updatedAt.toISOString(),
  };
}
