import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pickLocalized, type Locale } from '@/shared';
import { HeroSwooshes } from '@/components/catalog/hero';
import { getPage } from '@/lib/api';
import { alternatesFor, excerpt } from '@/lib/seo';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: pickLocalized(page.title, locale as Locale),
    description: excerpt(pickLocalized(page.content, locale as Locale)) || undefined,
    alternates: alternatesFor(locale, `/p/${slug}`),
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await getPage(slug);
  if (!page) notFound();
  const loc = locale as Locale;
  const t = await getTranslations('product');

  return (
    <>
      <section className="relative isolate overflow-hidden bg-lavender">
        <HeroSwooshes className="absolute inset-0 -z-10 h-full w-full opacity-80" />
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-16">
          <h1 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">{pickLocalized(page.title, loc)}</h1>
          <p className="mt-3 text-sm text-muted">{t('lastUpdated', { date: formatDate(page.updatedAt, loc) })}</p>
        </div>
      </section>
      <article className="mx-auto -mt-6 max-w-3xl px-4 sm:px-6">
        <div className="card prose-content p-6 sm:p-10" dangerouslySetInnerHTML={{ __html: pickLocalized(page.content, loc) }} />
      </article>
    </>
  );
}
