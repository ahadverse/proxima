import { Router } from 'express';
import { adminUserUpdateSchema, membershipActionSchema } from '@/shared';
import { validate } from '../../middlewares/validate';
import { idParams } from '../shared/common.validation';
import * as controller from './user.controller';
import { adminUserListQuery } from './user.validation';

export const adminUserRouter = Router();
adminUserRouter.get('/', validate({ query: adminUserListQuery }), controller.adminList);
adminUserRouter.get('/:id', validate({ params: idParams }), controller.adminDetail);
adminUserRouter.patch('/:id', validate({ params: idParams, body: adminUserUpdateSchema }), controller.adminUpdate);
adminUserRouter.post('/:id/membership', validate({ params: idParams, body: membershipActionSchema }), controller.adminSetMembership);
