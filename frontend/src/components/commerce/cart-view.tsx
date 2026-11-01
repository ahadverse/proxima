'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, BadgeCheck, CircleAlert, Lock, ShoppingCart, Trash2 } from 'lucide-react';
import type { Locale } from '@/shared';
import { pickLocalized } from '@/shared/utils';
import { Button } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { ProductImage } from '@/components/ui/product-image';
import { useCartQuote } from '@/hooks/use-cart-quote';
import { Link } from '@/i18n/navigation';
import { cn, formatPrice } from '@/lib/utils';
import { useCart } from '@/stores/cart';
import { CouponField, SummaryRows } from './order-summary';

export function CartView() {
  const t = useTranslations('cart');
  const tc = useTranslations('common');
  const locale = useLocale() as Locale;
  const remove = useCart((state) => state.remove);
  const removeMany = useCart((state) => state.removeMany);
  const { data: quote, isLoading, isFetching, hydrated, items } = useCartQuote();

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart />}
        title={t('empty')}
        text={t('emptyText')}
        action={
          <Button asChild>
            <Link href="/">
              {t('browse')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />
    );
  }

  const statusOf = (id: string) => quote?.lines.find((line) => line.productId === id)?.status ?? 'ok';
  const blocked = items.filter((item) => statusOf(item.id) !== 'ok').map((item) => item.id);
  const payableCount = quote ? quote.lines.filter((line) => line.status === 'ok').length : items.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="space-y-4">
        {blocked.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800">
            <span className="flex items-center gap-2 font-medium">
              <CircleAlert className="size-4" />
              {t('removeOwned')}
            </span>
            <Button size="sm" variant="secondary" onClick={() => removeMany(blocked)}>
              {t('remove')}
            </Button>
          </div>
        )}
        <ul className="space-y-4">
          {items.map((item) => {
            const status = statusOf(item.id);
            const line = quote?.lines.find((l) => l.productId === item.id);
            const price = line?.price ?? item.price;
            return (
              <li key={item.id} className={cn('card flex animate-fade-up gap-4 p-3 sm:p-4', status !== 'ok' && 'opacity-75')}>
                <Link href={`/product/${item.slug}`} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-lavender ring-1 ring-black/5 sm:h-28 sm:w-40">
                  <ProductImage src={item.thumbnail} alt="" fill sizes="160px" className="object-cover object-top" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/product/${item.slug}`} className="line-clamp-2 font-bold leading-snug text-ink transition hover:text-brand-700">
                    {pickLocalized(item.title, locale)}
                  </Link>
                  {status === 'owned' && (
                    <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <BadgeCheck className="size-3.5" />
                      {t('owned')}
                    </span>
                  )}
                  {status === 'unavailable' && (
                    <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                      <CircleAlert className="size-3.5" />
                      {t('unavailable')}
                    </span>
                  )}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-ink">{price === 0 ? tc('free') : formatPrice(price, locale)}</span>
                      {item.compareAtPrice && item.compareAtPrice > price && (
                        <span className="text-xs text-slate-400 line-through">{formatPrice(item.compareAtPrice, locale)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" />
                      {t('remove')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
          ← {t('continue')}
        </Link>
      </div>

      <aside className="card space-y-5 p-6 lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">{t('summary')}</h2>
          <span className="text-sm text-muted">{t('items', { count: payableCount })}</span>
        </div>
        <CouponField quote={quote} />
        <SummaryRows
          quote={quote}
          loading={isLoading}
          footer={
            <Button asChild block size="lg" className={cn('mt-2 h-[52px]', (payableCount === 0 || isFetching) && 'pointer-events-none opacity-60')}>
              <Link href="/checkout" aria-disabled={payableCount === 0}>
                <Lock className="size-4" />
                {t('checkout')}
              </Link>
            </Button>
          }
        />
      </aside>
    </div>
  );
}
