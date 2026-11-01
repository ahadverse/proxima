import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { logger } from './logger';

const baseUrl = env.PAYSTATION_BASE_URL.replace(/\/+$/, '');

export type GatewayStatus = 'success' | 'failed' | 'pending';

interface InitiateParams {
  invoiceNumber: string;
  amount: number;
  reference: string;
  customer: { name: string; email: string; phone: string };
  checkoutItems: string;
}

interface PayStationResponse {
  status_code?: string | number;
  status?: string;
  message?: string;
  payment_url?: string;
  data?: Record<string, unknown>;
}

async function post(path: string, body: Record<string, string>, headers: Record<string, string> = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', ...headers },
    body: new URLSearchParams(body),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  try {
    return JSON.parse(text) as PayStationResponse;
  } catch {
    logger.error({ path, status: response.status, body: text.slice(0, 500) }, 'PayStation returned a non-JSON response');
    return null;
  }
}

export async function initiatePayment(params: InitiateParams): Promise<{ paymentUrl: string }> {
  let json: PayStationResponse | null;
  try {
    json = await post('/initiate-payment', {
      merchantId: env.PAYSTATION_MERCHANT_ID,
      password: env.PAYSTATION_PASSWORD,
      invoice_number: params.invoiceNumber,
      currency: 'BDT',
      payment_amount: String(params.amount),
      pay_with_charge: '0',
      reference: params.reference,
      cust_name: params.customer.name,
      cust_phone: params.customer.phone,
      cust_email: params.customer.email,
      callback_url: env.PAYSTATION_CALLBACK_URL,
      checkout_items: params.checkoutItems.slice(0, 250),
    });
  } catch (error) {
    logger.error({ err: error }, 'PayStation initiate-payment request failed');
    throw new ApiError(502, 'Payment gateway is not responding. Please try again.', 'PAYMENT_GATEWAY_DOWN');
  }

  if (!json || String(json.status_code) !== '200' || !json.payment_url) {
    logger.warn({ response: json }, 'PayStation rejected initiate-payment');
    throw new ApiError(502, json?.message || 'Could not start the payment. Please try again.', 'PAYMENT_INIT_FAILED');
  }
  return { paymentUrl: json.payment_url };
}

const SUCCESS_STATES = new Set(['success', 'successful', 'completed', 'complete', 'paid']);
const FAILED_STATES = new Set(['failed', 'failure', 'fail', 'cancel', 'canceled', 'cancelled', 'expired', 'refunded', 'declined']);

export function normalizeGatewayStatus(value: unknown): GatewayStatus {
  const status = String(value ?? '').trim().toLowerCase();
  if (SUCCESS_STATES.has(status)) return 'success';
  if (FAILED_STATES.has(status)) return 'failed';
  return 'pending';
}

export interface TransactionStatus {
  status: GatewayStatus;
  trxId: string;
  amount: number;
  method: string;
  raw: unknown;
}

/** Server-to-server verification. Callback parameters are never trusted on their own. */
export async function getTransactionStatus(invoiceNumber: string): Promise<TransactionStatus> {
  let json: PayStationResponse | null = null;
  try {
    json = await post('/transaction-status', { invoice_number: invoiceNumber }, { merchantId: env.PAYSTATION_MERCHANT_ID });
  } catch (error) {
    logger.error({ err: error, invoiceNumber }, 'PayStation transaction-status request failed');
  }

  const data = (json?.data ?? {}) as Record<string, unknown>;
  if (!json || String(json.status_code) !== '200') {
    return { status: 'pending', trxId: '', amount: 0, method: '', raw: json };
  }

  return {
    status: normalizeGatewayStatus(data.trx_status),
    trxId: String(data.trx_id ?? ''),
    amount: Number(data.payment_amount ?? 0),
    method: String(data.payment_method ?? ''),
    raw: json,
  };
}
