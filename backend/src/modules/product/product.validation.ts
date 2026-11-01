import { z } from 'zod';
import { PRODUCT_STATUSES, PRODUCT_TYPES, objectIdSchema } from '@/shared';
import { adminListQuery } from '../shared/common.validation';

export const adminProductListQuery = adminListQuery.extend({
  status: z.enum(PRODUCT_STATUSES).optional().catch(undefined),
  type: z.enum(PRODUCT_TYPES).optional().catch(undefined),
  category: objectIdSchema.optional().catch(undefined),
  sort: z.enum(['latest', 'oldest', 'sales', 'views', 'price-asc', 'price-desc', 'order']).catch('latest'),
});

export type AdminProductListQuery = z.infer<typeof adminProductListQuery>;
