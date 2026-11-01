import type { Metadata } from 'next';
import { SITE_URL } from './utils';

/** Path for a locale under "as-needed" routing: English has no prefix, Bengali lives under /bn. */
export function localePath(locale: string, path = ''): string {
  const clean = path === '/' ? '' : path;
  if (locale === 'bn') return `/bn${clean}`;
  return clean || '/';
}

export function absoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Canonical URL plus hreflang links for a page that exists in both languages. */
export function alternatesFor(locale: string, path = ''): NonNullable<Metadata['alternates']> {
  return {
    canonical: localePath(locale, path),
    languages: {
      en: localePath('en', path),
      bn: localePath('bn', path),
      'x-default': localePath('en', path),
    },
  };
}

/** Plain-text meta description from rich text, cut at a word boundary. */
export function excerpt(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > max / 2 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

export function openGraphLocale(locale: string) {
  return locale === 'bn' ? 'bn_BD' : 'en_US';
}

/** Shared Open Graph fields; pages that override `openGraph` must spread these back in. */
export function openGraphBase(locale: string, siteName: string) {
  return {
    type: 'website' as const,
    siteName,
    locale: openGraphLocale(locale),
    alternateLocale: openGraphLocale(locale === 'bn' ? 'en' : 'bn'),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
