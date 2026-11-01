import { Router } from 'express';
import { siteSettingsSchema } from '@/shared';
import { validate } from '../../middlewares/validate';
import * as controller from './setting.controller';

export const settingRouter = Router();
settingRouter.get('/public', controller.getPublic);

export const adminSettingRouter = Router();
adminSettingRouter.get('/', controller.getAdmin);
adminSettingRouter.put('/', validate({ body: siteSettingsSchema }), controller.update);
