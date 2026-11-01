import { z } from 'zod';
import { COUPON_SCOPES, COUPON_TYPES, LOCALES } from '../constants';
import { emailSchema, nameSchema, phoneSchema } from './auth';
import { isoDateTimeSchema, objectIdSchema } from './common';

export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, 'too_short')
  .max(30, 'too_long')
  .regex(/^[A-Z0-9_-]+$/, 'invalid_coupon_code');

export const cartQuoteSchema = z.object({
  items: z.array(objectIdSchema).min(1, 'cart_empty').max(50),
  couponCode: z.string().trim().toUpperCase().max(30).optional(),
});

export const createOrderSchema = cartQuoteSchema.extend({
  customer: z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
  }),
  locale: z.enum(LOCALES).catch('en'),
});

export const couponInputSchema = z
  .object({
    code: couponCodeSchema,
    type: z.enum(COUPON_TYPES),
    value: z.number().int('integer').min(1, 'too_small'),
    maxDiscount: z.number().int().min(1).nullable(),
    minAmount: z.number().int().min(0),
    appliesTo: z.enum(COUPON_SCOPES),
    products: z.array(objectIdSchema).max(200),
    maxUses: z.number().int().min(1).nullable(),
    perUserLimit: z.number().int().min(1).nullable(),
    startsAt: isoDateTimeSchema.nullable(),
    endsAt: isoDateTimeSchema.nullable(),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'percent' && value.value > 100) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'percent_max' });
    }
    if (value.appliesTo === 'products' && value.products.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['products'], message: 'required' });
    }
    if (value.startsAt && value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt)) {
      ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'end_after_start' });
    }
  });

export const ratingInputSchema = z.object({
  stars: z.number().int().min(1, 'rating_required').max(5),
  comment: z.string().trim().max(1000, 'too_long'),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['paid', 'cancelled', 'refunded']),
  note: z.string().trim().max(300, 'too_long'),
});

export type CartQuoteInput = z.infer<typeof cartQuoteSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CouponInput = z.infer<typeof couponInputSchema>;
export type RatingInput = z.infer<typeof ratingInputSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
