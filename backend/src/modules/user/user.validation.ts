import { z } from 'zod';
import { USER_ROLES } from '@/shared';
import { adminListQuery } from '../shared/common.validation';

export const adminUserListQuery = adminListQuery.extend({
  role: z.enum(USER_ROLES).optional().catch(undefined),
  membership: z.enum(['active', 'none']).optional().catch(undefined),
  banned: z
    .enum(['1', 'true'])
    .optional()
    .catch(undefined)
    .transform((v) => v !== undefined),
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuery>;
