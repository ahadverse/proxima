import { z } from 'zod';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isHttpUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'invalid_id');

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'too_short')
  .max(120, 'too_long')
  .regex(SLUG_REGEX, 'invalid_slug');

/** Empty string or an absolute http(s) URL. */
export const optionalUrlSchema = z
  .string()
  .trim()
  .max(2048, 'too_long')
  .refine((v) => v === '' || isHttpUrl(v), 'invalid_url');

export const urlSchema = z
  .string()
  .trim()
  .min(1, 'required')
  .max(2048, 'too_long')
  .refine(isHttpUrl, 'invalid_url');

export const isoDateTimeSchema = z.iso.datetime({ offset: true, error: 'invalid_date' });

export function localizedSchema(max = 200) {
  return z.object({
    en: z.string().trim().max(max, 'too_long'),
    bn: z.string().trim().max(max, 'too_long'),
  });
}

/** Localized text where at least one language must be filled in. */
export function requiredLocalizedSchema(max = 200) {
  return localizedSchema(max).refine((v) => v.en.length > 0 || v.bn.length > 0, {
    message: 'required',
    path: ['en'],
  });
}
