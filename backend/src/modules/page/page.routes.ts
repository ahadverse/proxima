import { Router } from 'express';
import { pageInputSchema } from '@/shared';
import { validate } from '../../middlewares/validate';
import { idParams, slugParams } from '../shared/common.validation';
import * as controller from './page.controller';

export const pageRouter = Router();
pageRouter.get('/', controller.listPublished);
pageRouter.get('/:slug', validate({ params: slugParams }), controller.getPublished);

export const adminPageRouter = Router();
adminPageRouter.get('/', controller.listAll);
adminPageRouter.post('/', validate({ body: pageInputSchema }), controller.create);
adminPageRouter.get('/:id', validate({ params: idParams }), controller.getById);
adminPageRouter.put('/:id', validate({ params: idParams, body: pageInputSchema }), controller.update);
adminPageRouter.delete('/:id', validate({ params: idParams }), controller.remove);
