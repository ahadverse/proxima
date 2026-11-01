import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BadgeCheck, Clapperboard, MessageSquareQuote } from 'lucide-react';
import { pickLocalized, type Locale } from '@/shared';
import { RatingStars } from '@/components/catalog/rating-stars';
import { HeroSwooshes } from '@/components/catalog/hero';
import { VideoEmbed } from '@/components/product/video-embed';
import { EmptyState, SectionHeading } from '@/components/ui/misc';
import { Reveal } from '@/components/ui/reveal';
import { Link } from '@/i18n/navigation';
import { getLatestRatings, getVideoReviews } from '@/lib/api';
import { alternatesFor } from '@/lib/seo';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tr = await getTranslations({ locale, namespace: 'reviews' });
  return { title: t('reviewsTitle'), description: tr('subtitle'), alternates: alternatesFor(locale, '/reviews') };
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [videos, ratings, t, tRatings] = await Promise.all([getVideoReviews(), getLatestRatings(), getTranslations('reviews'), getTranslations('ratings')]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-lavender">
        <HeroSwooshes className="absolute inset-0 -z-10 h-full w-full" />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <h1 className="font-display text-4xl font-extrabold text-ink sm:text-6xl">{t('title')}</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft sm:text-lg">{t('subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <SectionHeading title={t('videos')} />
        {videos.length === 0 ? (
          <EmptyState icon={<Clapperboard />} title={t('noVideos')} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((video) => (
              <Reveal key={video._id}>
                <article className="card overflow-hidden p-3">
                  <VideoEmbed videoId={video.youtubeId} title={pickLocalized(video.title, loc)} playLabel={t('play')} />
                  <div className="px-3 pb-3 pt-4">
                    <h2 className="text-lg font-bold text-ink">{pickLocalized(video.title, loc)}</h2>
                    {pickLocalized(video.description, loc) && <p className="mt-1 text-sm text-muted">{pickLocalized(video.description, loc)}</p>}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <SectionHeading title={t('customer')} />
        {ratings.length === 0 ? (
          <EmptyState icon={<MessageSquareQuote />} title={t('noRatings')} />
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {ratings.map((rating) => (
              <article key={rating._id} className="card mb-5 break-inside-avoid p-6">
                <RatingStars value={rating.stars} size="md" />
                <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">“{rating.comment}”</p>
                <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <span className="grid size-10 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white">
                    {(rating.user?.name ?? '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">{rating.user?.name}</p>
                    <p className="flex items-center gap-1 text-xs text-emerald-600">
                      <BadgeCheck className="size-3.5" />
                      {tRatings('verified')} · {formatDate(rating.createdAt, loc)}
                    </p>
                  </div>
                </div>
                {rating.product && (
                  <Link href={`/product/${rating.product.slug}`} className="mt-3 block truncate text-xs font-semibold text-brand-700 hover:underline">
                    {pickLocalized(rating.product.title, loc)}
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
