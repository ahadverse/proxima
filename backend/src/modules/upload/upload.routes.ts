import { Router } from 'express';
import { fileUploadRequestSchema } from '@/shared';
import { validate } from '../../middlewares/validate';
import * as controller from './upload.controller';

export const adminUploadRouter = Router();
adminUploadRouter.post('/image', controller.uploadImage);
adminUploadRouter.post('/file', validate({ body: fileUploadRequestSchema }), controller.createFileUpload);
