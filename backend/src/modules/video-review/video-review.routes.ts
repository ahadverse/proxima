import { Router } from 'express';
import { reorderSchema, videoReviewInputSchema } from '@/shared';
import { validate } from '../../middlewares/validate';
import { idParams } from '../shared/common.validation';
import * as controller from './video-review.controller';

export const videoReviewRouter = Router();
videoReviewRouter.get('/', controller.listPublic);

export const adminVideoReviewRouter = Router();
adminVideoReviewRouter.get('/', controller.listAll);
adminVideoReviewRouter.post('/', validate({ body: videoReviewInputSchema }), controller.create);
adminVideoReviewRouter.patch('/reorder', validate({ body: reorderSchema }), controller.reorder);
adminVideoReviewRouter.put('/:id', validate({ params: idParams, body: videoReviewInputSchema }), controller.update);
adminVideoReviewRouter.delete('/:id', validate({ params: idParams }), controller.remove);
