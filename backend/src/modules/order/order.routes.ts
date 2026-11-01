import { Router } from 'express';
import { cartQuoteSchema, createOrderSchema, orderStatusUpdateSchema } from '@/shared';
import { optionalAuth, requireAuth } from '../../middlewares/auth';
import { checkoutLimiter, couponLimiter } from '../../middlewares/rateLimit';
import { validate } from '../../middlewares/validate';
import { idParams } from '../shared/common.validation';
import * as controller from './order.controller';
import { adminOrderListQuery, invoiceParams, myOrderQuery, myOrdersQuery } from './order.validation';

export const cartRouter = Router();
cartRouter.post('/quote', couponLimiter, optionalAuth, validate({ body: cartQuoteSchema }), controller.quote);

export const orderRouter = Router();
orderRouter.use(requireAuth);
orderRouter.post('/', checkoutLimiter, validate({ body: createOrderSchema }), controller.create);
orderRouter.get('/mine', validate({ query: myOrdersQuery }), controller.listMine);
orderRouter.get('/mine/:invoiceNo', validate({ params: invoiceParams, query: myOrderQuery }), controller.getMine);
orderRouter.post('/:invoiceNo/pay', checkoutLimiter, validate({ params: invoiceParams }), controller.pay);

export const adminOrderRouter = Router();
adminOrderRouter.get('/', validate({ query: adminOrderListQuery }), controller.adminList);
adminOrderRouter.get('/:id', validate({ params: idParams }), controller.adminGet);
adminOrderRouter.patch('/:id/status', validate({ params: idParams, body: orderStatusUpdateSchema }), controller.adminUpdateStatus);
