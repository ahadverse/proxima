import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChevronRight, ExternalLink, Layers, PlayCircle, Sparkles } from 'lucide-react';
import { TECH_STACK_LABELS, pickLocalized, youtubeId, type Locale } from '@/shared';
import { CopyButton } from '@/components/product/copy-button';
import { ProductGallery } from '@/components/product/gallery';
import { ProductTabs } from '@/components/product/product-tabs';
import { PurchaseCard } from '@/components/product/purchase-card';
import { RatingsPanel } from '@/components/product/ratings-panel';
import { RelatedProducts, RelatedProductsSkeleton } from '@/components/product/related-products';
import { VideoEmbed } from '@/components/product/video-embed';
import { ViewTracker } from '@/components/product/view-tracker';
import { JsonLd } from '@/components/seo/json-ld';
import { Badge } from '@/components/ui/misc';
import { Link } from '@/i18n/navigation';
import { getProduct, getSettings } from '@/lib/api';
import { absoluteUrl, alternatesFor, breadcrumbJsonLd, localePath, openGraphBase } from '@/lib/seo';
import { formatDate, formatNumber } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const [product, t] = await Promise.all([getProduct(slug), getTranslations({ locale, namespace: 'meta' })]);
  if (!product) return {};
  const name = pickLocalized(product.title, locale as Locale);
  const title = product.seo.title || name;
  const description = product.seo.description || pickLocalized(product.shortDescription, locale as Locale);
  const image = product.thumbnail || product.gallery[0];
  return {
    title,
    description,
    alternates: alternatesFor(locale, `/product/${slug}`),
    openGraph: {
      ...openGraphBase(locale, t('siteName')),
      title,
      description,
      url: localePath(locale, `/product/${slug}`),
      ...(image ? { images: [{ url: image, alt: name }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!product) notFound();

  const loc = locale as Locale;
  const t = await getTranslations('product');
  const tReviews = await getTranslations('reviews');
  const title = pickLocalized(product.title, loc);
  const description = pickLocalized(product.description, loc);
  const videoId = youtubeId(product.tutorialUrl);
  const images = product.gallery.length ? product.gallery : [product.thumbnail];
  const productPath = localePath(loc, `/product/${product.slug}`);
  const categoryName = product.category ? pickLocalized(product.category.name, loc) : undefined;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      image: images.filter(Boolean).map(absoluteUrl),
      description: pickLocalized(product.shortDescription, loc) || undefined,
      sku: product._id,
      url: absoluteUrl(productPath),
      brand: { '@type': 'Brand', name: settings.brand.name },
      category: categoryName,
      offers: {
        '@type': 'Offer',
        url: absoluteUrl(productPath),
        priceCurrency: 'BDT',
        price: product.price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: settings.brand.name },
      },
      ...(product.ratingCount > 0
        ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.ratingAvg, reviewCount: product.ratingCount, bestRating: 5 } }
        : {}),
    },
    breadcrumbJsonLd([
      { name: t('home'), path: localePath(loc) },
      ...(product.category && categoryName ? [{ name: categoryName, path: localePath(loc, `/category/${product.category.slug}`) }] : []),
      { name: title, path: productPath },
    ]),
  ];

  const techPanel = (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Layers className="size-5 text-brand-600" />
          {t('builtWith')}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {t('stack')}: <span className="font-semibold text-ink">{TECH_STACK_LABELS[product.techStack]}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.techTags.map((tag) => (
            <Badge key={tag} tone="neutral" className="px-3 py-1.5 text-[13px]">
              {tag}
            </Badge>
          ))}
        </div>
        {product.features.length > 0 && (
          <>
            <h3 className="mt-8 flex items-center gap-2 text-lg font-bold text-ink">
              <Sparkles className="size-5 text-brand-600" />
              {t('features')}
            </h3>
            <ul className="prose-content mt-3">
              {product.features.map((feature, index) => (
                <li key={index}>{pickLocalized(feature, loc)}</li>
              ))}
            </ul>
          </>
        )}
      </div>
      {product.demoAdmin && (
        <div className="h-fit rounded-2xl border border-brand-100 bg-brand-50 p-6">
          <h3 className="text-lg font-bold text-ink">{t('demoAdmin')}</h3>
          <p className="mt-1 text-sm text-muted">{t('demoAdminText')}</p>
          <dl className="mt-5 space-y-3">
            {[
              { label: t('email'), value: product.demoAdmin.email },
              { label: t('password'), value: product.demoAdmin.password },
            ]
              .filter((row) => row.value)
              .map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-2.5">
                  <div className="min-w-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{row.label}</dt>
                    <dd className="truncate font-mono text-sm text-ink">{row.value}</dd>
                  </div>
                  <CopyButton value={row.value} />
                </div>
              ))}
          </dl>
          {product.demoAdmin.url && (
            <a
              href={product.demoAdmin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink-soft"
            >
              <ExternalLink className="size-4" />
              {t('openDemoAdmin')}
            </a>
          )}
        </div>
      )}
    </div>
  );

  const changelogPanel =
    product.changelog.length === 0 ? (
      <p className="text-sm text-muted">{t('noChangelog')}</p>
    ) : (
      <ol className="relative space-y-6 border-l-2 border-brand-100 pl-6">
        {product.changelog.map((entry) => (
          <li key={entry.version + entry.date} className="relative">
            <span className="absolute -left-[33px] top-1 size-4 rounded-full border-4 border-white bg-brand-700 shadow" />
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t('version', { version: entry.version })}</Badge>
              <span className="text-xs text-muted">{formatDate(entry.date, loc)}</span>
            </div>
            {pickLocalized(entry.notes, loc) && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pickLocalized(entry.notes, loc)}</p>}
          </li>
        ))}
      </ol>
    );

  return (
    <div className="bg-[linear-gradient(to_bottom,var(--color-lavender),transparent_420px)]">
      <JsonLd data={jsonLd} />
      <ViewTracker slug={product.slug} />
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6 sm:pt-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-brand-700">
            {t('home')}
          </Link>
          <ChevronRight className="size-3.5" />
          {product.category ? (
            <Link href={`/category/${product.category.slug}`} className="transition hover:text-brand-700">
              {pickLocalized(product.category.name, loc)}
            </Link>
          ) : (
            <Link href="/" className="transition hover:text-brand-700">
              {t('allProducts')}
            </Link>
          )}
          <ChevronRight className="size-3.5" />
          <span className="line-clamp-1 font-medium text-ink-soft">{title}</span>
        </nav>

        {/* grid-cols-1 (a bounded `minmax(0, 1fr)` track): without it the phone layout is one auto-sized column, which grows to
            the gallery's thumbnail strip (4 thumbnails > the screen) and pushes the whole page wider than the screen. */}
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr] lg:items-start">
          <ProductGallery title={title} images={images} previewUrl={product.previewUrl} adminDemoUrl={product.demoAdmin?.url ?? ''} />
          <div className="lg:sticky lg:top-24">
            <PurchaseCard product={product} offer={settings.offerBar} />
          </div>
        </div>

        <div className="mt-8">
          <ProductTabs
            tabs={[
              {
                value: 'description',
                label: t('tabs.description'),
                content: description ? (
                  <div className="prose-content max-w-3xl" dangerouslySetInnerHTML={{ __html: description }} />
                ) : (
                  <p className="text-sm text-muted">{t('noDescription')}</p>
                ),
              },
              { value: 'tech', label: t('tabs.tech'), content: techPanel },
              {
                value: 'ratings',
                label: t('tabs.ratings'),
                badge: product.ratingCount ? formatNumber(product.ratingCount, loc) : undefined,
                content: <RatingsPanel slug={product.slug} />,
                lazy: true,
              },
              { value: 'changelog', label: t('tabs.changelog'), content: changelogPanel },
            ]}
          />
        </div>

        {videoId && (
          <section id="tutorial" className="mt-10 scroll-mt-28">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-700 text-white shadow-glow">
                <PlayCircle className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-ink">{t('installGuide')}</h2>
                <p className="text-sm text-muted">{t('installGuideText')}</p>
              </div>
            </div>
            <VideoEmbed videoId={videoId} title={`${title} | ${t('installGuide')}`} playLabel={tReviews('play')} className="shadow-card" />
          </section>
        )}

        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProducts slug={product.slug} />
        </Suspense>
      </div>
    </div>
  );
}
