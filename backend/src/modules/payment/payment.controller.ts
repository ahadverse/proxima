import type { Request, Response } from 'express';
import * as service from './payment.service';
import type { PaymentCallbackQuery } from './payment.validation';

export async function callback(req: Request, res: Response) {
  const redirectTo = await service.handleCallback(req.query as unknown as PaymentCallbackQuery);
  res.redirect(303, redirectTo);
}
