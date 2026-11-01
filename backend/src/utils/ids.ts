import { customAlphabet } from 'nanoid';

const base36 = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);
const keyId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

/** Invoice numbers look like PX-261031-7K2QD (date in Dhaka time + random suffix). */
export function generateInvoiceNo(date = new Date()): string {
  const dhaka = new Date(date.getTime() + 6 * 60 * 60 * 1000);
  const yy = String(dhaka.getUTCFullYear()).slice(-2);
  const mm = String(dhaka.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dhaka.getUTCDate()).padStart(2, '0');
  return `PX-${yy}${mm}${dd}-${base36()}`;
}

export function randomKey(): string {
  return keyId();
}
