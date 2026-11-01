import type { FilterQuery, Types } from 'mongoose';
import {
  normalizeBdPhone,
  pickLocalized,
  type CartQuoteDTO,
  type CartQuoteInput,
  type CreateOrderInput,
  type OrderStatusUpdateInput,
  type PaymentProvider,
  type QuoteLineDTO,
} from '@/shared';
import { getTransactionStatus, initiatePayment } from '../../lib/paystation';
import { logger } from '../../lib/logger';
import { ApiError } from '../../utils/ApiError';
import { generateInvoiceNo } from '../../utils/ids';
import { buildMeta, containsRegex, toSkip } from '../../utils/pagination';
import { evaluateCoupon, markUsed } from '../coupon/coupon.service';
import { hasAccess, loadAccessContext } from '../library/entitlement.service';
import { toCardDTO } from '../product/product.mapper';
import { CARD_FIELDS, CATEGORY_POPULATE, Product } from '../product/product.model';
import { User } from '../user/user.model';
import { Order, isOrderExpired, toOrderDTO, type IOrder } from './order.model';
import type { AdminOrderListQuery } from './order.validation';

/* ---------------------------------- Quote --------------------------------- */

interface QuoteResult extends CartQuoteDTO {
  couponId: Types.ObjectId | null;
}

export async function quote(input: CartQuoteInput, userId?: string): Promise<QuoteResult> {
  const ids = [...new Set(input.items)];
  const [products, access] = await Promise.all([
    Product.find({ _id: { $in: ids } }).select(`${CARD_FIELDS} status`).populate(CATEGORY_POPULATE).lean(),
    userId ? loadAccessContext(userId) : Promise.resolve(null),
  ]);
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines: QuoteLineDTO[] = ids.map((id) => {
    const product = byId.get(id);
    if (!product || product.status !== 'published') {
      return { productId: id, product: null, price: 0, status: 'unavailable' };
    }
    const card = toCardDTO(product);
    if (access && hasAccess(access, product)) {
      return { productId: id, product: card, price: product.price, status: 'owned' };
    }
    return { productId: id, product: card, price: product.price, status: 'ok' };
  });

  const payable = lines.filter((line) => line.status === 'ok');
  const subtotal = payable.reduce((sum, line) => sum + line.price, 0);

  let discount = 0;
  let coupon: CartQuoteDTO['coupon'] = null;
  let couponError: string | null = null;
  let couponId: Types.ObjectId | null = null;

  if (input.couponCode) {
    const evaluation = await evaluateCoupon(
      input.couponCode,
      payable.map((line) => ({ productId: line.productId, type: line.product!.type, price: line.price })),
      userId,
    );
    if (evaluation.ok) {
      discount = evaluation.discount;
      coupon = { code: evaluation.coupon.code, discount };
      couponId = evaluation.coupon._id;
    } else {
      couponError = evaluation.error;
    }
  }

  return { lines, subtotal, discount, total: Math.max(0, subtotal - discount), coupon, couponError, couponId };
}

/* ------------------------------ Fulfillment ------------------------------ */

interface PaymentDetails {
  provider: PaymentProvider;
  trxId?: string;
  method?: string;
  amount: number;
  raw?: unknown;
}

/**
 * Moves an order to "paid" exactly once and grants everything it contains.
 * The conditional update makes repeated callbacks harmless.
 */
export async function fulfillOrder(orderId: Types.ObjectId | string, payment: PaymentDetails, note = '', by: string | null = null) {
  const now = new Date();
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: { $in: ['pending', 'failed'] } },
    {
      $set: {
        status: 'paid',
        flagged: false,
        payment: {
          provider: payment.provider,
          trxId: payment.trxId ?? '',
          method: payment.method ?? '',
          amount: payment.amount,
          paidAt: now,
          raw: payment.raw ?? null,
        },
      },
      $push: { statusHistory: { status: 'paid', at: now, note: note || 'Payment confirmed', by } },
    },
    { new: true },
  );
  if (!order) return null;

  await Product.updateMany({ _id: { $in: order.items.map((item) => item.product) } }, { $inc: { sales: 1 } });
  if (order.coupon?.couponId) await markUsed(order.coupon.couponId);
  if (order.items.some((item) => item.type === 'membership')) {
    await User.updateOne(
      { _id: order.user },
      { $set: { 'membership.active': true, 'membership.activatedAt': now, 'membership.order': order._id } },
    );
  }
  logger.info({ invoiceNo: order.invoiceNo, total: order.total, provider: payment.provider }, 'Order fulfilled');
  return order;
}

async function startPayment(order: IOrder & { save?: unknown }) {
  const attempt = order.paymentAttempts + 1;
  const paymentRef = attempt === 1 ? order.invoiceNo : `${order.invoiceNo}-R${attempt}`;
  await Order.updateOne({ _id: order._id }, { $set: { paymentRef, paymentAttempts: attempt } });

  const { paymentUrl } = await initiatePayment({
    invoiceNumber: paymentRef,
    amount: order.total,
    reference: order.invoiceNo,
    customer: order.customer,
    checkoutItems: order.items.map((item) => pickLocalized(item.title, 'en')).join(', '),
  });
  return paymentUrl;
}

/* -------------------------------- Customer -------------------------------- */

export async function createOrder(userId: string, input: CreateOrderInput) {
  const result = await quote(input, userId);
  const payable = result.lines.filter((line) => line.status === 'ok' && line.product);
  if (payable.length === 0) {
    throw ApiError.badRequest('There is nothing to purchase in your cart', 'NOTHING_TO_PURCHASE');
  }
  if (input.couponCode && result.couponError) {
    throw ApiError.badRequest('This coupon cannot be applied', 'COUPON_INVALID', [
      { path: 'couponCode', message: result.couponError },
    ]);
  }

  const invoiceNo = generateInvoiceNo();
  const order = await Order.create({
    invoiceNo,
    paymentRef: invoiceNo,
    user: userId,
    customer: { ...input.customer, phone: normalizeBdPhone(input.customer.phone) },
    items: payable.map((line) => ({
      product: line.productId,
      type: line.product!.type,
      title: line.product!.title,
      slug: line.product!.slug,
      thumbnail: line.product!.thumbnail,
      price: line.price,
    })),
    subtotal: result.subtotal,
    discount: result.discount,
    total: result.total,
    coupon: result.coupon && result.couponId ? { ...result.coupon, couponId: result.couponId } : null,
    locale: input.locale,
    statusHistory: [{ status: 'pending', at: new Date(), note: 'Order placed' }],
  });

  await User.updateOne({ _id: userId, phone: '' }, { $set: { phone: normalizeBdPhone(input.customer.phone) } });

  if (order.total === 0) {
    await fulfillOrder(order._id, { provider: 'free', amount: 0 }, 'Free order');
    const paid = await Order.findById(order._id).lean();
    return { order: toOrderDTO(paid!), paymentUrl: null };
  }

  const paymentUrl = await startPayment(order);
  return { order: toOrderDTO(order.toObject()), paymentUrl };
}

export async function retryPayment(userId: string, invoiceNo: string) {
  const order = await Order.findOne({ invoiceNo, user: userId }).lean();
  if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');
  if (order.status === 'paid') throw ApiError.conflict('This order is already paid', 'ORDER_ALREADY_PAID');
  if (order.status !== 'pending' && order.status !== 'failed') {
    throw ApiError.badRequest('This order can no longer be paid', 'ORDER_CLOSED');
  }
  if (isOrderExpired(order)) {
    throw ApiError.badRequest('This order has expired. Please place a new order.', 'ORDER_EXPIRED');
  }
  if (order.status === 'failed') {
    await Order.updateOne(
      { _id: order._id },
      { $set: { status: 'pending' }, $push: { statusHistory: { status: 'pending', at: new Date(), note: 'Payment retried' } } },
    );
  }
  return { paymentUrl: await startPayment(order) };
}

export async function listMine(userId: string, page: number, limit: number) {
  const filter = { user: userId };
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(toSkip(page, limit)).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return { items: items.map(toOrderDTO), meta: buildMeta(total, page, limit) };
}

/** Returns the order, re-checking the gateway when a payment is still unconfirmed. */
export async function getMine(userId: string, invoiceNo: string, verify: boolean) {
  let order = await Order.findOne({ invoiceNo, user: userId }).lean();
  if (!order) throw ApiError.notFound('Order not found', 'ORDER_NOT_FOUND');

  if (verify && order.status === 'pending' && order.paymentAttempts > 0 && !isOrderExpired(order)) {
    const status = await getTransactionStatus(order.paymentRef);
    if (status.status === 'success' && status.amount + 0.5 >= order.total) {
      await fulfillOrder(order._id, {
        provider: 'paystation',
        trxId: status.trxId,
        method: status.method,
        amount: status.amount,
        raw: status.raw,
      });
      order = (await Order.findById(order._id).lean())!;
    }
  }
  return toOrderDTO(order);
}

/* ---------------------------------- Admin --------------------------------- */

export async function adminList(query: AdminOrderListQuery) {
  const filter: FilterQuery<IOrder> = {};
  if (query.status) filter.status = query.status;
  if (query.flagged) filter.flagged = true;
  if (query.from || query.to) {
    filter.createdAt = {
      ...(query.from ? { $gte: new Date(query.from) } : {}),
      ...(query.to ? { $lte: new Date(query.to) } : {}),
    };
  }
  if (query.q) {
    const regex = containsRegex(query.q);
    filter.$or = [{ invoiceNo: regex }, { 'customer.email': regex }, { 'customer.name': regex }, { 'customer.phone': regex }];
  }

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(toSkip(query.page, query.limit))
      .limit(query.limit)
      .lean(),
    Order.countDocuments(filter),
  ]);
  return { items: items.map(toOrderDTO), meta: buildMeta(total, query.page, query.limit) };
}

export async function adminGet(id: string) {
  const order = await Order.findById(id).populate('user', 'name email').lean();
  if (!order) throw ApiError.notFound('Order not found');
  return toOrderDTO(order);
}

export async function adminUpdateStatus(id: string, input: OrderStatusUpdateInput, adminId: string) {
  const order = await Order.findById(id).lean();
  if (!order) throw ApiError.notFound('Order not found');
  const note = input.note || '';

  if (input.status === 'paid') {
    const result = await fulfillOrder(
      order._id,
      { provider: 'manual', amount: order.total, method: 'Manual verification' },
      note || 'Marked as paid by admin',
      adminId,
    );
    if (!result) throw ApiError.badRequest('Only pending or failed orders can be marked as paid', 'INVALID_TRANSITION');
  } else if (input.status === 'cancelled') {
    const result = await Order.updateOne(
      { _id: order._id, status: { $in: ['pending', 'failed'] } },
      { $set: { status: 'cancelled' }, $push: { statusHistory: { status: 'cancelled', at: new Date(), note: note || 'Cancelled by admin', by: adminId } } },
    );
    if (result.modifiedCount === 0) throw ApiError.badRequest('Only pending or failed orders can be cancelled', 'INVALID_TRANSITION');
  } else {
    const result = await Order.updateOne(
      { _id: order._id, status: 'paid' },
      { $set: { status: 'refunded' }, $push: { statusHistory: { status: 'refunded', at: new Date(), note: note || 'Refunded by admin', by: adminId } } },
    );
    if (result.modifiedCount === 0) throw ApiError.badRequest('Only paid orders can be refunded', 'INVALID_TRANSITION');
    if (order.items.some((item) => item.type === 'membership')) {
      await User.updateOne(
        { _id: order.user, 'membership.order': order._id },
        { $set: { 'membership.active': false, 'membership.activatedAt': null, 'membership.order': null } },
      );
    }
  }
  return adminGet(id);
}
