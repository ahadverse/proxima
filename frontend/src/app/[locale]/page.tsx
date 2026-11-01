import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pickLocalized, type Locale } from '@/shared';
import { CatalogView } from '@/components/catalog/catalog-view';
import { Hero } from '@/components/catalog/hero';
import { CatalogSkeleton } from '@/components/catalog/skeletons';
import { JsonLd } from '@/components/seo/json-ld';
import { getSettings } from '@/lib/api';
import { parseCatalogParams, type RawSearchParams } from '@/lib/search-params';
import { absoluteUrl, alternatesFor, localePath } from '@/lib/seo';
import { SITE_URL } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q, page } = parseCatalogParams(await searchParams);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: q ? t('searchTitle', { query: q }) : { absolute: t('homeTitle') },
    description: t('homeDescription'),
    alternates: alternatesFor(locale),
    // Only set when needed: an explicit `robots: undefined` would wipe the layout's googleBot settings.
    ...(q || page > 1 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { sort, page, q } = parseCatalogParams(await searchParams);
  const [settings, t] = await Promise.all([getSettings(), getTranslations('meta')]);
  const { brand, contact, socials } = settings;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: brand.name,
      url: SITE_URL,
      logo: absoluteUrl(brand.logo || '/icon.svg'),
      description: pickLocalized(brand.footerAbout, locale as Locale) || undefined,
      sameAs: Object.values(socials).filter(Boolean),
      ...(contact.phone || contact.email
        ? {
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              telephone: contact.phone || undefined,
              email: contact.email || undefined,
              availableLanguage: ['English', 'Bengali'],
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: t('siteName'),
      url: absoluteUrl(localePath(locale)),
      inLanguage: locale,
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl(localePath(locale))}?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero query={q} />
      <Suspense key={`${q}-${sort}-${page}`} fallback={<CatalogSkeleton />}>
        <CatalogView q={q} sort={sort} page={page} />
      </Suspense>
    </>
  );
}
