import type { FilterQuery } from 'mongoose';
import type { AdminUserDetailDTO, AdminUserUpdateInput } from '@/shared';
import { ApiError } from '../../utils/ApiError';
import { buildMeta, containsRegex, toSkip } from '../../utils/pagination';
import { Order, toOrderDTO } from '../order/order.model';
import type { AdminUserListQuery } from './user.validation';
import { User, toUserDTO, type IUser } from './user.model';

export async function adminList(query: AdminUserListQuery) {
  const filter: FilterQuery<IUser> = {};
  if (query.role) filter.role = query.role;
  if (query.membership === 'active') filter['membership.active'] = true;
  if (query.membership === 'none') filter['membership.active'] = { $ne: true };
  if (query.banned) filter.isBanned = true;
  if (query.q) {
    const regex = containsRegex(query.q);
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(toSkip(query.page, query.limit)).limit(query.limit).lean(),
    User.countDocuments(filter),
  ]);
  return { items: items.map(toUserDTO), meta: buildMeta(total, query.page, query.limit) };
}

export async function adminDetail(id: string): Promise<AdminUserDetailDTO> {
  const user = await User.findById(id).lean();
  if (!user) throw ApiError.notFound('User not found');
  const orders = await Order.find({ user: id }).sort({ createdAt: -1 }).limit(50).lean();
  const paid = orders.filter((order) => order.status === 'paid');
  return {
    user: toUserDTO(user),
    orders: orders.map(toOrderDTO),
    stats: { spent: paid.reduce((sum, order) => sum + order.total, 0), paidOrders: paid.length },
  };
}

export async function adminUpdate(id: string, input: AdminUserUpdateInput, adminId: string) {
  if (id === adminId && (input.role === 'user' || input.isBanned)) {
    throw ApiError.badRequest('You cannot demote or ban your own account', 'SELF_UPDATE_BLOCKED');
  }
  const update: Record<string, unknown> = {};
  const inc: Record<string, number> = {};
  if (input.role !== undefined) update.role = input.role;
  if (input.isBanned !== undefined) {
    update.isBanned = input.isBanned;
    if (input.isBanned) inc.tokenVersion = 1;
  }
  const user = await User.findByIdAndUpdate(
    id,
    { $set: update, ...(Object.keys(inc).length ? { $inc: inc } : {}) },
    { new: true },
  ).lean();
  if (!user) throw ApiError.notFound('User not found');
  return toUserDTO(user);
}

export async function adminSetMembership(id: string, action: 'grant' | 'revoke') {
  const update =
    action === 'grant'
      ? { 'membership.active': true, 'membership.activatedAt': new Date(), 'membership.order': null }
      : { 'membership.active': false, 'membership.activatedAt': null, 'membership.order': null };
  const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!user) throw ApiError.notFound('User not found');
  return toUserDTO(user);
}
