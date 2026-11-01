import { Router } from 'express';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '@/shared';
import { requireAuth } from '../../middlewares/auth';
import { authLimiter, passwordResetLimiter } from '../../middlewares/rateLimit';
import { validate } from '../../middlewares/validate';
import * as controller from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate({ body: registerSchema }), controller.register);
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), controller.login);
authRouter.post('/logout', controller.logout);
authRouter.post('/refresh', controller.refresh);
authRouter.get('/me', requireAuth, controller.me);
authRouter.patch('/me', requireAuth, validate({ body: updateProfileSchema }), controller.updateMe);
authRouter.patch('/me/password', requireAuth, authLimiter, validate({ body: changePasswordSchema }), controller.changePassword);
authRouter.post('/forgot-password', passwordResetLimiter, validate({ body: forgotPasswordSchema }), controller.forgotPassword);
authRouter.post('/reset-password', passwordResetLimiter, validate({ body: resetPasswordSchema }), controller.resetPassword);
