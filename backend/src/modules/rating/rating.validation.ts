import { z } from 'zod';
import { RATING_STATUSES, objectIdSchema } from '@/shared';
import { adminListQuery } from '../shared/common.validation';

export const ratingPageQuery = z.object({
  page: z.coerce.number().int().min(1).max(1000).catch(1),
});

export const ratingStatusBody = z.object({
  status: z.enum(RATING_STATUSES),
});

export const adminRatingListQuery = adminListQuery.extend({
  status: z.enum(RATING_STATUSES).optional().catch(undefined),
  product: objectIdSchema.optional().catch(undefined),
});

export type AdminRatingListQuery = z.infer<typeof adminRatingListQuery>;
