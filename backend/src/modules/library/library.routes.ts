import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { idParams } from '../shared/common.validation';
import * as controller from './library.controller';

export const libraryRouter = Router();
libraryRouter.use(requireAuth);
libraryRouter.get('/', controller.list);
libraryRouter.get('/:id/download', validate({ params: idParams }), controller.download);
