import { defineRouting } from 'next-intl/routing';
// Not the '@/shared' barrel: this file reaches every client bundle, and the barrel drags in all zod schemas.
import { DEFAULT_LOCALE, LOCALES } from '@/shared/constants';

export const routing = defineRouting({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeCookie: { name: 'px_locale', maxAge: 60 * 60 * 24 * 365 },
});
