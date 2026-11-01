import { z } from 'zod';
import { objectIdSchema, slugSchema } from '@/shared';

export const idParams = z.object({ id: objectIdSchema });
export const slugParams = z.object({ slug: z.string().trim().toLowerCase().max(160) });
export const strictSlugParams = z.object({ slug: slugSchema });

export const adminListQuery = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20),
});

export type AdminListQuery = z.infer<typeof adminListQuery>;
