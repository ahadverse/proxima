import { Router } from 'express';
import { categoryInputSchema, reorderSchema } from '@/shared';
import { validate } from '../../middlewares/validate';
import { idParams } from '../shared/common.validation';
import * as controller from './category.controller';

export const categoryRouter = Router();
categoryRouter.get('/', controller.listPublic);

export const adminCategoryRouter = Router();
adminCategoryRouter.get('/', controller.listAll);
adminCategoryRouter.post('/', validate({ body: categoryInputSchema }), controller.create);
adminCategoryRouter.patch('/reorder', validate({ body: reorderSchema }), controller.reorder);
adminCategoryRouter.put('/:id', validate({ params: idParams, body: categoryInputSchema }), controller.update);
adminCategoryRouter.delete('/:id', validate({ params: idParams }), controller.remove);
