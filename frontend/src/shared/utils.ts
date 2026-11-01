import type { Locale } from './constants';
import type { Localized } from './types';

/** Picks the value for a locale, falling back to the other language when empty. */
export function pickLocalized(value: Partial<Localized> | null | undefined, locale: Locale): string {
  if (!value) return '';
  const primary = value[locale]?.trim();
  if (primary) return primary;
  const fallback = locale === 'en' ? value.bn : value.en;
  return fallback?.trim() ?? '';
}

const YOUTUBE_PATTERNS = [
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)([\w-]{11})/,
  /^([\w-]{11})$/,
];

/** Extracts the 11-character video id from any common YouTube URL format. */
export function youtubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Normalises a Bangladeshi mobile number to the 11-digit local format (01XXXXXXXXX). */
export function normalizeBdPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) return digits.slice(2);
  if (digits.startsWith('88')) return digits.slice(2);
  return digits;
}

export function discountPercent(price: number, compareAtPrice?: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price || compareAtPrice <= 0) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
