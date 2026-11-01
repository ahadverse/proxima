import { Schema, model, type Types } from 'mongoose';
import {
  LOCALES,
  ORDER_EXPIRY_HOURS,
  ORDER_STATUSES,
  PAYMENT_PROVIDERS,
  PRODUCT_TYPES,
  type Locale,
  type Localized,
  type OrderDTO,
  type OrderStatus,
  type PaymentProvider,
  type ProductType,
} from '@/shared';
import { localizedSchema } from '../shared/localized.schema';

export interface IOrderItem {
  product: Types.ObjectId;
  type: ProductType;
  title: Localized;
  slug: string;
  thumbnail: string;
  price: number;
}

export interface IOrder {
  _id: Types.ObjectId;
  invoiceNo: string;
  paymentRef: string;
  paymentAttempts: number;
  user: Types.ObjectId;
  customer: { name: string; email: string; phone: string };
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon: { code: string; discount: number; couponId: Types.ObjectId } | null;
  status: OrderStatus;
  locale: Locale;
  flagged: boolean;
  payment: {
    provider: PaymentProvider | null;
    trxId: string;
    method: string;
    amount: number;
    paidAt: Date | null;
    raw: unknown;
  };
  statusHistory: { status: OrderStatus; at: Date; note: string; by: Types.ObjectId | null }[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: PRODUCT_TYPES, required: true },
    title: { type: localizedSchema, required: true },
    slug: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    invoiceNo: { type: String, required: true, unique: true },
    paymentRef: { type: String, required: true, unique: true },
    paymentAttempts: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    coupon: {
      type: new Schema(
        {
          code: { type: String, required: true },
          discount: { type: Number, required: true },
          couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
        },
        { _id: false },
      ),
      default: null,
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    locale: { type: String, enum: LOCALES, default: 'en' },
    flagged: { type: Boolean, default: false },
    payment: {
      provider: { type: String, enum: [...PAYMENT_PROVIDERS, null], default: null },
      trxId: { type: String, default: '' },
      method: { type: String, default: '' },
      amount: { type: Number, default: 0 },
      paidAt: { type: Date, default: null },
      raw: { type: Schema.Types.Mixed, default: null, select: false },
    },
    statusHistory: {
      type: [
        new Schema(
          {
            status: { type: String, enum: ORDER_STATUSES, required: true },
            at: { type: Date, default: Date.now },
            note: { type: String, default: '' },
            by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, status: 1, createdAt: -1 });
orderSchema.index({ 'items.product': 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customer.email': 1 });

export const Order = model<IOrder>('Order', orderSchema);

export function isOrderExpired(order: Pick<IOrder, 'status' | 'createdAt'>): boolean {
  if (order.status !== 'pending' && order.status !== 'failed') return false;
  return Date.now() - new Date(order.createdAt).getTime() > ORDER_EXPIRY_HOURS * 60 * 60 * 1000;
}

type OrderDoc = Omit<IOrder, 'user'> & { user: unknown };

export function toOrderDTO(order: OrderDoc): OrderDTO {
  const user = order.user as { _id?: unknown; name?: string; email?: string } | Types.ObjectId;
  const userValue =
    user && typeof user === 'object' && 'email' in user && user.email
      ? { _id: String(user._id), name: user.name ?? '', email: user.email }
      : String(user);

  return {
    _id: String(order._id),
    invoiceNo: order.invoiceNo,
    user: userValue,
    customer: order.customer,
    items: order.items.map((item) => ({
      product: String(item.product),
      type: item.type,
      title: item.title,
      slug: item.slug,
      thumbnail: item.thumbnail,
      price: item.price,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    coupon: order.coupon ? { code: order.coupon.code, discount: order.coupon.discount } : null,
    status: order.status,
    isExpired: isOrderExpired(order),
    payment: {
      provider: order.payment?.provider ?? null,
      trxId: order.payment?.trxId ?? '',
      method: order.payment?.method ?? '',
      amount: order.payment?.amount ?? 0,
      paidAt: order.payment?.paidAt ? new Date(order.payment.paidAt).toISOString() : null,
    },
    statusHistory: (order.statusHistory ?? []).map((entry) => ({
      status: entry.status,
      at: new Date(entry.at).toISOString(),
      note: entry.note,
    })),
    createdAt: new Date(order.createdAt).toISOString(),
    updatedAt: new Date(order.updatedAt).toISOString(),
  };
}
