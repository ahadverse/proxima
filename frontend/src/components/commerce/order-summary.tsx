'use client';

import { useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BadgePercent, X } from 'lucide-react';
import type { CartQuoteDTO } from '@/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/misc';
import { useErrorMessage } from '@/hooks/use-error-message';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/stores/cart';

export function CouponField({ quote }: { quote: CartQuoteDTO | undefined }) {
  const t = useTranslations('cart');
  const { field } = useErrorMessage();
  const couponCode = useCart((state) => state.couponCode);
  const setCoupon = useCart((state) => state.setCoupon);
  const [value, setValue] = useState(couponCode);

  if (couponCode && quote?.coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <BadgePercent className="size-4" />
          {t('couponApplied', { code: quote.coupon.code })}
        </span>
        <button
          type="button"
          onClick={() => {
            setCoupon('');
            setValue('');
          }}
          aria-label={t('removeCoupon')}
          className="grid size-7 place-items-center rounded-full text-emerald-700 transition hover:bg-emerald-100"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  // Rendered inside the checkout form, so this must not be a <form> of its own.
  const apply = () => {
    if (value.trim()) setCoupon(value);
  };

  return (
    <div role="group" aria-labelledby="coupon-label">
      <label id="coupon-label" htmlFor="coupon" className="mb-1.5 block text-sm font-semibold text-ink-soft">
        {t('coupon')}
      </label>
      <div className="flex gap-2">
        <Input
          id="coupon"
          value={value}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              apply();
            }
          }}
          placeholder={t('couponPlaceholder')}
          className="h-11 font-mono uppercase tracking-wider"
          aria-invalid={Boolean(couponCode && quote?.couponError)}
        />
        <Button type="button" variant="dark" className="h-11 shrink-0" disabled={!value.trim()} onClick={apply}>
          {t('apply')}
        </Button>
      </div>
      {couponCode && quote?.couponError && (
        <p role="alert" className="mt-1.5 text-[13px] font-medium text-red-600">
          {field(quote.couponError)}
        </p>
      )}
    </div>
  );
}

export function SummaryRows({ quote, loading, footer }: { quote: CartQuoteDTO | undefined; loading: boolean; footer?: ReactNode }) {
  const t = useTranslations('cart');
  const locale = useLocale();

  const row = (label: string, value: ReactNode, className = '') => (
    <div className={`flex items-center justify-between text-sm ${className}`}>
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );

  if (loading && !quote) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-4 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {row(t('subtotal'), formatPrice(quote?.subtotal ?? 0, locale))}
      {quote && quote.discount > 0 &&
        row(t('discount'), <span className="text-emerald-600">−{formatPrice(quote.discount, locale)}</span>)}
      <div className="flex items-end justify-between border-t border-dashed border-line pt-4">
        <span className="font-semibold text-ink">{t('total')}</span>
        <span className="font-display text-3xl font-extrabold text-brand-700">{formatPrice(quote?.total ?? 0, locale)}</span>
      </div>
      {footer}
    </div>
  );
}
