import { useLocale, useTranslations } from 'next-intl';
import { CircleCheck, ShieldCheck } from 'lucide-react';
import { discountPercent, pickLocalized, type Locale, type ProductDetailDTO, type SiteSettingsDTO } from '@/shared';
import { Countdown } from '@/components/layout/countdown';
import { Badge } from '@/components/ui/misc';
import { formatPrice } from '@/lib/utils';
import { BuyActions } from './buy-actions';

export function PurchaseCard({ product, offer }: { product: ProductDetailDTO; offer: SiteSettingsDTO['offerBar'] }) {
  const t = useTranslations('product');
  const tc = useTranslations('common');
  const locale = useLocale() as Locale;
  const percent = discountPercent(product.price, product.compareAtPrice);

  return (
    <div className="card p-6 sm:p-7">
      <h1 className="text-2xl font-extrabold leading-tight text-ink sm:text-[28px]">{pickLocalized(product.title, locale)}</h1>
      {pickLocalized(product.shortDescription, locale) && (
        <p className="mt-2 text-sm leading-relaxed text-muted">{pickLocalized(product.shortDescription, locale)}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {product.isFree ? (
          <span className="font-display text-4xl font-extrabold text-brand-700">{tc('free')}</span>
        ) : (
          <>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg font-medium text-slate-400 line-through">{formatPrice(product.compareAtPrice, locale)}</span>
            )}
            <span className="font-display text-4xl font-extrabold text-brand-700">{formatPrice(product.price, locale)}</span>
            {percent > 0 && <Badge tone="success">{t('save', { percent })}</Badge>}
          </>
        )}
      </div>

      {product.highlights.length > 0 && (
        <ul className="mt-6 grid gap-x-4 gap-y-3 border-t border-line pt-6 sm:grid-cols-2">
          {product.highlights.map((highlight, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-ink-soft">
              <CircleCheck className="size-[18px] shrink-0 text-emerald-500" />
              {pickLocalized(highlight, locale)}
            </li>
          ))}
        </ul>
      )}

      {offer.enabled && !product.isFree && (
        <div className="mt-6">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">{t('offerEndsIn')}</p>
          <Countdown mode={offer.mode} endsAt={offer.endsAt} variant="boxes" />
        </div>
      )}

      <div className="mt-6">
        <BuyActions product={product} />
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-muted">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
        {t('secureCheckout')}
      </p>
    </div>
  );
}
