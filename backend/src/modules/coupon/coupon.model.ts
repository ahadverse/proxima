import { Schema, model, type Types } from 'mongoose';
import { COUPON_SCOPES, COUPON_TYPES, type CouponDTO, type CouponScope, type CouponType } from '@/shared';

export interface ICoupon {
  _id: Types.ObjectId;
  code: string;
  type: CouponType;
  value: number;
  maxDiscount: number | null;
  minAmount: number;
  appliesTo: CouponScope;
  products: Types.ObjectId[];
  maxUses: number | null;
  usedCount: number;
  perUserLimit: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: COUPON_TYPES, required: true },
    value: { type: Number, required: true, min: 1 },
    maxDiscount: { type: Number, default: null },
    minAmount: { type: Number, default: 0 },
    appliesTo: { type: String, enum: COUPON_SCOPES, default: 'all' },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: null },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon = model<ICoupon>('Coupon', couponSchema);

export function toCouponDTO(coupon: ICoupon): CouponDTO {
  return {
    _id: String(coupon._id),
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    maxDiscount: coupon.maxDiscount,
    minAmount: coupon.minAmount,
    appliesTo: coupon.appliesTo,
    products: coupon.products.map(String),
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    perUserLimit: coupon.perUserLimit,
    startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
    endsAt: coupon.endsAt ? coupon.endsAt.toISOString() : null,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt.toISOString(),
  };
}
