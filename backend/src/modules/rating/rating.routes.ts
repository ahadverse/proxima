import { Router } from 'express';
import { ratingInputSchema } from '@/shared';
import { optionalAuth, requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { idParams, slugParams } from '../shared/common.validation';
import * as controller from './rating.controller';
import { adminRatingListQuery, ratingPageQuery, ratingStatusBody } from './rating.validation';

/** Mounted under /products so ratings live at /products/:slug/ratings. */
export const productRatingRouter = Router();
productRatingRouter.get('/:slug/ratings', optionalAuth, validate({ params: slugParams, query: ratingPageQuery }), controller.listForProduct);
productRatingRouter.post('/:slug/ratings', requireAuth, validate({ params: slugParams, body: ratingInputSchema }), controller.upsert);

export const ratingRouter = Router();
ratingRouter.get('/latest', controller.latest);

export const adminRatingRouter = Router();
adminRatingRouter.get('/', validate({ query: adminRatingListQuery }), controller.adminList);
adminRatingRouter.patch('/:id', validate({ params: idParams, body: ratingStatusBody }), controller.adminSetStatus);
adminRatingRouter.delete('/:id', validate({ params: idParams }), controller.adminRemove);
