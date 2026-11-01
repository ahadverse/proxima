import { useLocale, useTranslations } from 'next-intl';
import { Eye, ShoppingBag } from 'lucide-react';
import { pickLocalized, type Locale, type ProductCardDTO } from '@/shared';
import { ProductImage } from '@/components/ui/product-image';
import { Link } from '@/i18n/navigation';
import { cn, formatCompact, formatPrice } from '@/lib/utils';
import { AddToCartButton } from './add-to-cart-button';
import { RatingStars } from './rating-stars';

const CATEGORY_DOT = ['bg-brand-500', 'bg-fuchsia-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

function dotColor(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return CATEGORY_DOT[hash % CATEGORY_DOT.length];
}

export function PriceRibbon({ product, className }: { product: ProductCardDTO; className?: string }) {
  const locale = useLocale();
  const t = useTranslations('common');
  return (
    <div
      className={cn(
        'absolute bottom-3 right-0 flex items-baseline gap-1.5 bg-brand-700 py-1.5 pl-5 pr-3 text-white shadow-[0_8px_20px_-8px_rgb(85_28_150/0.8)] [clip-path:polygon(14px_0,100%_0,100%_100%,0_100%)]',
        className,
      )}
    >
      {product.isFree ? (
        <span className="text-[15px] font-extrabold tracking-wide">{t('free')}</span>
      ) : (
        <>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[11px] font-medium text-white/70 line-through">{formatPrice(product.compareAtPrice, locale)}</span>
          )}
          <span className="text-[16px] font-extrabold">{formatPrice(product.price, locale)}</span>
        </>
      )}
    </div>
  );
}

/** `eager` is for the first cards on screen, whose images are the page's largest contentful paint. */
export function ProductCard({ product, eager = false }: { product: ProductCardDTO; eager?: boolean }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('common');
  const tCatalog = useTranslations('catalog');
  const title = pickLocalized(product.title, locale);
  const category = product.category ? pickLocalized(product.category.name, locale) : product.type === 'plugin' ? tCatalog('plugin') : '';

  return (
    <article className="group card relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover">
      <Link href={`/product/${product.slug}`} className="block p-2.5 pb-0" aria-label={title}>
        <div className="screenshot-scroll relative aspect-[4/3.3] overflow-hidden rounded-xl bg-lavender ring-1 ring-black/[0.04]">
          <ProductImage
            src={product.thumbnail}
            alt={title}
            fill
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 92vw"
            className="object-cover"
          />
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-5 items-center justify-center bg-gradient-to-r from-black/25 to-transparent">
            <span className="rotate-180 text-[8px] font-semibold uppercase tracking-[0.3em] text-white/80 [writing-mode:vertical-rl]">
              {tCatalog('watermark')}
            </span>
          </span>
          <PriceRibbon product={product} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        {category && (
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
            <span className={cn('size-1.5 rounded-full', dotColor(product.category?.slug ?? product.type))} />
            {category}
          </span>
        )}
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink transition-colors group-hover:text-brand-700">
          <Link href={`/product/${product.slug}`}>{title}</Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-2.5 text-[11.5px] text-muted">
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" />
                {t('views', { count: formatCompact(product.views, locale) })}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="size-3.5" />
                {t('sold', { count: formatCompact(product.sales, locale) })}
              </span>
            </p>
            <RatingStars value={product.ratingCount ? product.ratingAvg : 5} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {product.previewUrl && (
              <a
                href={product.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3.5 text-[12.5px] font-semibold text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
              >
                {t('preview')}
              </a>
            )}
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}
