import { z } from 'zod';
import { ORDER_STATUSES } from '@/shared';
import { adminListQuery } from '../shared/common.validation';

export const invoiceParams = z.object({
  invoiceNo: z.string().trim().toUpperCase().regex(/^PX-\d{6}-[A-Z0-9]{5}$/, 'invalid_invoice'),
});

export const myOrdersQuery = z.object({
  page: z.coerce.number().int().min(1).max(1000).catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(10),
});

export const myOrderQuery = z.object({
  verify: z
    .enum(['1', 'true'])
    .optional()
    .catch(undefined)
    .transform((v) => v !== undefined),
});

export const adminOrderListQuery = adminListQuery.extend({
  status: z.enum(ORDER_STATUSES).optional().catch(undefined),
  flagged: z
    .enum(['1', 'true'])
    .optional()
    .catch(undefined)
    .transform((v) => v !== undefined),
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
});

export type AdminOrderListQuery = z.infer<typeof adminOrderListQuery>;
