import { Router } from 'express';
import { couponInputSchema } from '@/shared';
import { validate } from '../../middlewares/validate';
import { adminListQuery, idParams } from '../shared/common.validation';
import * as controller from './coupon.controller';

export const adminCouponRouter = Router();
adminCouponRouter.get('/', validate({ query: adminListQuery }), controller.list);
adminCouponRouter.post('/', validate({ body: couponInputSchema }), controller.create);
adminCouponRouter.put('/:id', validate({ params: idParams, body: couponInputSchema }), controller.update);
adminCouponRouter.delete('/:id', validate({ params: idParams }), controller.remove);
