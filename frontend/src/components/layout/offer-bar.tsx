'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';
import type { Locale, SiteSettingsDTO } from '@/shared';
import { pickLocalized } from '@/shared/utils';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import { Countdown, useCountdown } from './countdown';

export function OfferBar({ offer }: { offer: SiteSettingsDTO['offerBar'] }) {
  const locale = useLocale() as Locale;
  const { expired, ready } = useCountdown(offer.mode, offer.endsAt);

  if (!offer.enabled || (ready && expired)) return null;

  const isExternal = /^https?:\/\//.test(offer.ctaHref);
  const cta = (
    <>
      {pickLocalized(offer.ctaLabel, locale)}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </>
  );
  const ctaClass =
    'group inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-[12.5px] font-bold text-brand-800 shadow-[0_6px_20px_-6px_rgb(255_255_255/0.6)] transition hover:bg-brand-50 sm:h-9 sm:px-4 sm:text-[13px]';

  return (
    <div className="bg-brand-700 relative overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(400px_60px_at_15%_120%,rgb(189_158_226/0.35),transparent)]" />
      <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 sm:gap-6">
        <Countdown mode={offer.mode} endsAt={offer.endsAt} className="hidden sm:flex" />
        <div className="flex items-center gap-2 text-[13px] font-semibold sm:text-[15px]">
          <Sparkles className="hidden size-4 text-brand-200 sm:block" />
          <span>{pickLocalized(offer.label, locale)}</span>
          <span className="font-extrabold text-white">{formatPrice(offer.price, locale)}</span>
          {offer.comparePrice > offer.price && (
            <span className="text-xs text-white/55 line-through">{formatPrice(offer.comparePrice, locale)}</span>
          )}
        </div>
        {isExternal ? (
          <a href={offer.ctaHref} className={ctaClass} target="_blank" rel="noopener noreferrer">
            {cta}
          </a>
        ) : (
          <Link href={offer.ctaHref} className={ctaClass}>
            {cta}
          </Link>
        )}
      </div>
    </div>
  );
}
