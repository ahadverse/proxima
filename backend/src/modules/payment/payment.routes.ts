import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import * as controller from './payment.controller';
import { paymentCallbackQuery } from './payment.validation';

export const paymentRouter = Router();
paymentRouter.get('/callback', validate({ query: paymentCallbackQuery }), controller.callback);
