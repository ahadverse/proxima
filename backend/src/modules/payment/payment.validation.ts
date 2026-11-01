import { z } from 'zod';

export const paymentCallbackQuery = z.object({
  status: z.string().trim().max(40).optional().catch(undefined),
  invoice_number: z.string().trim().max(60).optional().catch(undefined),
  trx_id: z.string().trim().max(120).optional().catch(undefined),
});

export type PaymentCallbackQuery = z.infer<typeof paymentCallbackQuery>;
