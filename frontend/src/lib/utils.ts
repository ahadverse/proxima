import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Locale } from '@/shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const intlLocale = (locale: string) => (locale === 'bn' ? 'bn-BD' : 'en-US');

export function formatNumber(value: number, locale: Locale | string) {
  return new Intl.NumberFormat(intlLocale(locale)).format(value);
}

export function formatCompact(value: number, locale: Locale | string) {
  return new Intl.NumberFormat(intlLocale(locale), { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatPrice(value: number, locale: Locale | string) {
  return `৳${formatNumber(value, locale)}`;
}

export function formatDate(value: string | Date, locale: Locale | string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
    ...options,
  }).format(new Date(value));
}

export function formatBytes(bytes: number) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, '');
  const full = digits.startsWith('0') ? `88${digits}` : digits;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

// Vercel provides the production domain, which covers the case where NEXT_PUBLIC_SITE_URL isn't set.
const vercelDomain = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || (vercelDomain ? `https://${vercelDomain}` : 'http://localhost:3000')).replace(/\/+$/, '');

const r2Host = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname : '';

/** next/image can only optimize hosts allowed in next.config; everything else is served as-is. */
export function isOptimizableImage(src: string) {
  try {
    const host = new URL(src).hostname;
    return host === r2Host || host === 'i.ytimg.com';
  } catch {
    return src.startsWith('/');
  }
}
