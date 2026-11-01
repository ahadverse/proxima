import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChevronRight } from 'lucide-react';
import { pickLocalized, type Locale } from '@/shared';
import { CatalogView } from '@/components/catalog/catalog-view';
import { HeroSwooshes } from '@/components/catalog/hero';
import { CatalogSkeleton } from '@/components/catalog/skeletons';
import { JsonLd } from '@/components/seo/json-ld';
import { Link } from '@/i18n/navigation';
import { getCategories } from '@/lib/api';
import { parseCatalogParams, type RawSearchParams } from '@/lib/search-params';
import { alternatesFor, breadcrumbJsonLd, localePath } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

async function findCategory(slug: string) {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await findCategory(slug);
  if (!category) return {};
  const { q, page } = parseCatalogParams(await searchParams);
  const t = await getTranslations({ locale, namespace: 'meta' });
  const name = pickLocalized(category.name, locale as Locale);
  return {
    title: t('categoryTitle', { category: name }),
    description: t('categoryDescription', { category: name }),
    alternates: alternatesFor(locale, `/category/${slug}`),
    ...(q || page > 1 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const category = await findCategory(slug);
  if (!category) notFound();

  const { sort, page, q } = parseCatalogParams(await searchParams);
  const t = await getTranslations('product');
  const tCatalog = await getTranslations('catalog');
  const name = pickLocalized(category.name, locale as Locale);
  const breadcrumbs = breadcrumbJsonLd([
    { name: t('home'), path: localePath(locale) },
    { name, path: localePath(locale, `/category/${slug}`) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <section className="relative isolate overflow-hidden bg-lavender">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_240px_at_20%_0%,rgb(189_158_226/0.45),transparent)]" />
        <HeroSwooshes className="absolute inset-0 -z-10 h-full w-full opacity-70" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <nav className="flex items-center gap-1.5 text-[13px] text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-700">
              {t('home')}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-ink-soft">{name}</span>
          </nav>
          <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">{name}</h1>
          <p className="mt-2 text-muted">{tCatalog('results', { count: category.productCount })}</p>
        </div>
      </section>
      <Suspense key={`${slug}-${q}-${sort}-${page}`} fallback={<CatalogSkeleton />}>
        <CatalogView category={slug} q={q} sort={sort} page={page} />
      </Suspense>
    </>
  );
}
