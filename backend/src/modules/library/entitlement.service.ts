import { MEMBERSHIP_COVERED_TYPES, type ProductType } from '@/shared';
import { Order } from '../order/order.model';
import { User } from '../user/user.model';

interface ProductRef {
  _id: unknown;
  type: ProductType;
  status?: string;
}

export interface AccessContext {
  isBanned: boolean;
  membershipActive: boolean;
  purchased: Set<string>;
}

export async function loadAccessContext(userId: string): Promise<AccessContext> {
  const [user, orders] = await Promise.all([
    User.findById(userId).select('isBanned membership').lean(),
    Order.find({ user: userId, status: 'paid' }).select('items.product').lean(),
  ]);
  const purchased = new Set<string>();
  for (const order of orders) for (const item of order.items) purchased.add(String(item.product));
  return {
    isBanned: Boolean(user?.isBanned),
    membershipActive: Boolean(user?.membership?.active),
    purchased,
  };
}

/** True when the user owns the product (paid order) or an active membership covers it. */
export function hasAccess(context: AccessContext, product: ProductRef): boolean {
  if (context.isBanned) return false;
  if (context.purchased.has(String(product._id))) return true;
  if (!context.membershipActive) return false;
  if (product.type === 'membership') return true;
  return MEMBERSHIP_COVERED_TYPES.includes(product.type) && product.status !== 'draft';
}

export async function canAccess(userId: string, product: ProductRef): Promise<boolean> {
  return hasAccess(await loadAccessContext(userId), product);
}
