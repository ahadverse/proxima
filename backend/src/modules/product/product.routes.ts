import { Router } from 'express';
import { productInputSchema, productQuerySchema, productStatusSchema, suggestQuerySchema } from '@/shared';
import { viewLimiter } from '../../middlewares/rateLimit';
import { validate } from '../../middlewares/validate';
import { idParams, slugParams } from '../shared/common.validation';
import * as controller from './product.controller';
import { adminProductListQuery } from './product.validation';

export const productRouter = Router();
productRouter.get('/', validate({ query: productQuerySchema }), controller.list);
productRouter.get('/suggest', validate({ query: suggestQuerySchema }), controller.suggest);
productRouter.get('/:slug', validate({ params: slugParams }), controller.detail);
productRouter.get('/:slug/related', validate({ params: slugParams }), controller.related);
productRouter.post('/:slug/view', viewLimiter, validate({ params: slugParams }), controller.view);

export const membershipRouter = Router();
membershipRouter.get('/', controller.membership);

export const adminProductRouter = Router();
adminProductRouter.get('/', validate({ query: adminProductListQuery }), controller.adminList);
adminProductRouter.post('/', validate({ body: productInputSchema }), controller.create);
adminProductRouter.get('/:id', validate({ params: idParams }), controller.adminGet);
adminProductRouter.put('/:id', validate({ params: idParams, body: productInputSchema }), controller.update);
adminProductRouter.patch('/:id/status', validate({ params: idParams, body: productStatusSchema }), controller.setStatus);
adminProductRouter.delete('/:id', validate({ params: idParams }), controller.remove);
