import type { FilterQuery, Types } from 'mongoose';
import type { CouponInput, ProductType } from '@/shared';
import { ApiError } from '../../utils/ApiError';
import { buildMeta, containsRegex, toSkip } from '../../utils/pagination';
import { Order } from '../order/order.model';
import type { AdminListQuery } from '../shared/common.validation';
import { Coupon, toCouponDTO, type ICoupon } from './coupon.model';

export interface CouponLine {
  productId: string;
  type: ProductType;
  price: number;
}

export type CouponEvaluation =
  | { ok: true; coupon: ICoupon; discount: number }
  | { ok: false; error: string };

/**
 * Validates a coupon against the purchasable lines of a cart. Error values are
 * message keys the storefront translates (coupon_expired, coupon_min_amount, ...).
 */
export async function evaluateCoupon(code: string, lines: CouponLine[], userId?: string): Promise<CouponEvaluation> {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() }).lean();
  if (!coupon || !coupon.isActive) return { ok: false, error: 'coupon_invalid' };

  const now = Date.now();
  if (coupon.startsAt && coupon.startsAt.getTime() > now) return { ok: false, error: 'coupon_not_started' };
  if (coupon.endsAt && coupon.endsAt.getTime() < now) return { ok: false, error: 'coupon_expired' };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { ok: false, error: 'coupon_used_up' };

  if (coupon.perUserLimit !== null && userId) {
    const used = await Order.countDocuments({ user: userId, status: 'paid', 'coupon.couponId': coupon._id });
    if (used >= coupon.perUserLimit) return { ok: false, error: 'coupon_user_limit' };
  }

  const allowedProducts = new Set(coupon.products.map(String));
  const eligible = lines.filter((line) => {
    if (coupon.appliesTo === 'membership') return line.type === 'membership';
    if (coupon.appliesTo === 'products') return allowedProducts.has(line.productId);
    return true;
  });
  const eligibleSubtotal = eligible.reduce((sum, line) => sum + line.price, 0);

  if (eligibleSubtotal <= 0) return { ok: false, error: 'coupon_not_applicable' };
  if (eligibleSubtotal < coupon.minAmount) return { ok: false, error: 'coupon_min_amount' };

  let discount =
    coupon.type === 'percent' ? Math.floor((eligibleSubtotal * coupon.value) / 100) : Math.min(coupon.value, eligibleSubtotal);
  if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);

  return { ok: true, coupon, discount: Math.max(0, Math.min(discount, eligibleSubtotal)) };
}

export async function markUsed(couponId: Types.ObjectId) {
  await Coupon.updateOne({ _id: couponId }, { $inc: { usedCount: 1 } });
}

/* ---------------------------------- Admin --------------------------------- */

export async function list(query: AdminListQuery) {
  const filter: FilterQuery<ICoupon> = query.q ? { code: containsRegex(query.q) } : {};
  const [items, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(toSkip(query.page, query.limit)).limit(query.limit).lean(),
    Coupon.countDocuments(filter),
  ]);
  return { items: items.map(toCouponDTO), meta: buildMeta(total, query.page, query.limit) };
}

function normalize(input: CouponInput) {
  return {
    ...input,
    products: input.appliesTo === 'products' ? input.products : [],
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
  };
}

export async function create(input: CouponInput) {
  const coupon = await Coupon.create(normalize(input));
  return toCouponDTO(coupon);
}

export async function update(id: string, input: CouponInput) {
  const coupon = await Coupon.findByIdAndUpdate(id, { $set: normalize(input) }, { new: true, runValidators: true }).lean();
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return toCouponDTO(coupon);
}

export async function remove(id: string) {
  const deleted = await Coupon.findByIdAndDelete(id).lean();
  if (!deleted) throw ApiError.notFound('Coupon not found');
}
