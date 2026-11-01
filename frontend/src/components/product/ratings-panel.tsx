'use client';

import { useEffect, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { BadgeCheck, MessageSquareText, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductRatingsDTO, RatingDTO } from '@/shared';
import { RatingStars } from '@/components/catalog/rating-stars';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/misc';
import { useMe } from '@/hooks/use-auth';
import { useErrorMessage } from '@/hooks/use-error-message';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/client-api';
import { cn, formatDate, formatNumber } from '@/lib/utils';

function RatingForm({ slug, mine }: { slug: string; mine: RatingDTO | null }) {
  const t = useTranslations('ratings');
  const { message, field } = useErrorMessage();
  const queryClient = useQueryClient();
  const [stars, setStars] = useState(mine?.stars ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(mine?.comment ?? '');
  const [error, setError] = useState<string>();

  useEffect(() => {
    setStars(mine?.stars ?? 0);
    setComment(mine?.comment ?? '');
  }, [mine]);

  const mutation = useMutation({
    mutationFn: () => api<RatingDTO>(`/products/${slug}/ratings`, { method: 'POST', body: { stars, comment } }),
    onSuccess: () => {
      toast.success(t('thanks'));
      queryClient.invalidateQueries({ queryKey: ['ratings', slug] });
    },
    onError: (err) => toast.error(message(err)),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!stars) {
          setError(field('rating_required'));
          return;
        }
        setError(undefined);
        mutation.mutate();
      }}
      className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
    >
      <p className="text-sm font-bold text-ink">{mine ? t('yourRating') : t('rateThis')}</p>
      <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStars(value)}
            onMouseEnter={() => setHover(value)}
            aria-label={t('stars', { count: value })}
            aria-pressed={stars === value}
            className="rounded-md p-0.5 transition hover:scale-110"
          >
            <Star className={cn('size-7', (hover || stars) >= value ? 'text-amber-400' : 'text-slate-300')} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-[13px] font-medium text-red-600">{error}</p>}
      <label htmlFor="rating-comment" className="mt-4 block text-sm font-semibold text-ink-soft">
        {t('comment')}
      </label>
      <Textarea
        id="rating-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={1000}
        placeholder={t('commentPlaceholder')}
        className="mt-1.5"
      />
      <Button type="submit" loading={mutation.isPending} className="mt-4">
        {mine ? t('update') : t('submit')}
      </Button>
    </form>
  );
}

export function RatingsPanel({ slug }: { slug: string }) {
  const t = useTranslations('ratings');
  const locale = useLocale();
  const { data: user } = useMe();

  const query = useInfiniteQuery({
    queryKey: ['ratings', slug, user?._id ?? 'guest'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => api<ProductRatingsDTO>(`/products/${slug}/ratings?page=${pageParam}`),
    getNextPageParam: (last) => (last.meta && last.meta.page < last.meta.pages ? last.meta.page + 1 : undefined),
  });

  if (query.isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  const first = query.data?.pages[0]?.data;
  if (!first) return null;
  const { summary, mine, canRate } = first;
  const items = query.data!.pages.flatMap((page) => page.data.items);

  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <div className="h-fit rounded-2xl border border-line bg-white p-6 text-center">
        <p className="font-display text-5xl font-extrabold text-ink">{summary.count ? formatNumber(summary.avg, locale) : '–'}</p>
        <RatingStars value={summary.avg} size="md" className="mt-2" />
        <p className="mt-2 text-sm text-muted">{summary.count ? t('basedOn', { count: summary.count }) : t('none')}</p>
        <div className="mt-5 space-y-2">
          {(['5', '4', '3', '2', '1'] as const).map((key) => {
            const count = summary.distribution[key];
            const percent = summary.count ? Math.round((count / summary.count) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-3 font-semibold">{formatNumber(Number(key), locale)}</span>
                <Star className="size-3 text-amber-400" fill="currentColor" strokeWidth={0} />
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-6 text-right tabular-nums">{formatNumber(count, locale)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {user && canRate && <RatingForm slug={slug} mine={mine} />}
        {user && !canRate && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">{t('onlyOwners')}</p>}
        {!user && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-muted">
            {t('onlyOwners')}
            <Button asChild size="sm" variant="secondary">
              <Link href={`/login?next=/product/${slug}`}>{t('signInToRate')}</Link>
            </Button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line py-12 text-center">
            <MessageSquareText className="size-8 text-brand-300" />
            <p className="mt-3 font-semibold text-ink">{t('none')}</p>
            <p className="mt-1 text-sm text-muted">{t('beFirst')}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((rating) => (
              <li key={rating._id} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white">
                      {(rating.user?.name ?? '?').charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{rating.user?.name}</p>
                      <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <BadgeCheck className="size-3.5" />
                        {t('verified')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <RatingStars value={rating.stars} />
                    <p className="mt-1 text-xs text-muted">{formatDate(rating.createdAt, locale)}</p>
                  </div>
                </div>
                {rating.comment && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{rating.comment}</p>}
              </li>
            ))}
          </ul>
        )}
        {query.hasNextPage && (
          <Button variant="secondary" block loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
            {t('loadMore')}
          </Button>
        )}
      </div>
    </div>
  );
}
