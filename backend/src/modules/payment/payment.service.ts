import { env } from '../../config/env';
import { getTransactionStatus, normalizeGatewayStatus } from '../../lib/paystation';
import { logger } from '../../lib/logger';
import { Order } from '../order/order.model';
import { fulfillOrder } from '../order/order.service';
import type { PaymentCallbackQuery } from './payment.validation';

const clientUrl = env.CLIENT_URL.replace(/\/+$/, '');

function checkoutUrl(locale: string, outcome: 'success' | 'failed', params: Record<string, string>) {
  const prefix = locale === 'bn' ? '/bn' : '';
  return `${clientUrl}${prefix}/checkout/${outcome}?${new URLSearchParams(params).toString()}`;
}

/**
 * Handles the browser redirect from PayStation. The query string only tells us
 * which invoice to look at; the result always comes from transaction-status.
 */
export async function handleCallback(query: PaymentCallbackQuery): Promise<string> {
  const ref = query.invoice_number;
  const order = ref ? await Order.findOne({ paymentRef: ref }).lean() : null;
  if (!order) {
    logger.warn({ query }, 'Payment callback for an unknown invoice');
    return checkoutUrl('en', 'failed', { reason: 'not_found' });
  }

  const success = checkoutUrl(order.locale, 'success', { invoice: order.invoiceNo });
  const failed = (reason: string) => checkoutUrl(order.locale, 'failed', { invoice: order.invoiceNo, reason });

  if (order.status === 'paid') return success;
  if (order.status === 'cancelled' || order.status === 'refunded') return failed('closed');

  const verification = await getTransactionStatus(ref!);

  if (verification.status === 'success') {
    if (verification.amount + 0.5 < order.total) {
      await Order.updateOne(
        { _id: order._id },
        {
          $set: { flagged: true },
          $push: {
            statusHistory: {
              status: order.status,
              at: new Date(),
              note: `Amount mismatch: gateway reported ${verification.amount}, order total ${order.total}`,
            },
          },
        },
      );
      logger.error({ invoiceNo: order.invoiceNo, reported: verification.amount, total: order.total }, 'Payment amount mismatch');
      return failed('review');
    }
    await fulfillOrder(order._id, {
      provider: 'paystation',
      trxId: verification.trxId || query.trx_id || '',
      method: verification.method,
      amount: verification.amount,
      raw: verification.raw,
    });
    return success;
  }

  const callbackStatus = normalizeGatewayStatus(query.status);
  if (verification.status === 'failed' || callbackStatus === 'failed') {
    const cancelled = /cancel/i.test(query.status ?? '');
    await Order.updateOne(
      { _id: order._id, status: 'pending' },
      {
        $set: { status: 'failed' },
        $push: { statusHistory: { status: 'failed', at: new Date(), note: cancelled ? 'Payment cancelled by customer' : 'Payment failed' } },
      },
    );
    return failed(cancelled ? 'cancelled' : 'failed');
  }

  // Gateway has not settled yet; the success page keeps checking.
  return success;
}
