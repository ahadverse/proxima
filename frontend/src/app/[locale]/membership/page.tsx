import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, BadgePercent, CircleCheck, Crown, Globe, Puzzle, Rocket } from 'lucide-react';
import { discountPercent, pickLocalized, type Locale } from '@/shared';
import { ProductCard } from '@/components/catalog/product-card';
import { HeroSwooshes } from '@/components/catalog/hero';
import { Countdown } from '@/components/layout/countdown';
import { BuyActions } from '@/components/product/buy-actions';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { Badge, SectionHeading } from '@/components/ui/misc';
import { Reveal } from '@/components/ui/reveal';
import { Link } from '@/i18n/navigation';
import { getMembership, getSettings } from '@/lib/api';
import { absoluteUrl, alternatesFor, localePath } from '@/lib/seo';
import { formatNumber, formatPrice } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tm = await getTranslations({ locale, namespace: 'membership' });
  return { title: t('membershipTitle'), description: tm('subtitle'), alternates: alternatesFor(locale, '/membership') };
}

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [membership, settings, t, tProduct] = await Promise.all([
    getMembership(),
    getSettings(),
    getTranslations('membership'),
    getTranslations('product'),
  ]);
  const product = membership.product;
  const percent = product ? discountPercent(product.price, product.compareAtPrice) : 0;
  const stats = [
    { icon: Globe, value: formatNumber(membership.counts.websites, loc), label: t('websites') },
    { icon: Puzzle, value: formatNumber(membership.counts.plugins, loc), label: t('plugins') },
    { icon: Rocket, value: t('unlimited'), label: t('future') },
  ];
  const coupon = settings.promoPopup;

  const jsonLd: object[] = [];
  if (product) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: pickLocalized(product.title, loc),
      description: t('subtitle'),
      image: product.thumbnail ? [absoluteUrl(product.thumbnail)] : undefined,
      sku: product._id,
      url: absoluteUrl(localePath(loc, '/membership')),
      brand: { '@type': 'Brand', name: settings.brand.name },
      offers: {
        '@type': 'Offer',
        url: absoluteUrl(localePath(loc, '/membership')),
        priceCurrency: 'BDT',
        price: product.price,
        availability: 'https://schema.org/InStock',
      },
    });
  }
  if (settings.membershipFaq.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: settings.membershipFaq.map((item) => ({
        '@type': 'Question',
        name: pickLocalized(item.q, loc),
        acceptedAnswer: { '@type': 'Answer', text: pickLocalized(item.a, loc) },
      })),
    });
  }

  return (
    <>
      {jsonLd.length > 0 && <JsonLd data={jsonLd} />}
      <section className="relative isolate overflow-hidden bg-brand-700 text-white">
        <HeroSwooshes className="absolute inset-0 -z-10 h-full w-full opacity-40" />
        <div className="absolute -right-32 -top-32 -z-10 size-[520px] rounded-full bg-white/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Badge tone="dark" className="bg-white/10 px-3 py-1.5 ring-1 ring-white/20">
              <Crown className="size-4 text-amber-300" />
              {t('eyebrow')}
            </Badge>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] sm:text-6xl">{t('title')}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">{t('subtitle')}</p>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                  <Icon className="size-5 text-brand-200" />
                  <p className="mt-2 text-2xl font-extrabold">{value}</p>
                  <p className="text-xs text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-7 text-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] sm:p-8">
            {product ? (
              <>
                <p className="text-sm font-semibold text-muted">{pickLocalized(product.title, loc)}</p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <span className="font-display text-5xl font-extrabold text-brand-700">{formatPrice(product.price, loc)}</span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="mb-1.5 text-lg text-slate-400 line-through">{formatPrice(product.compareAtPrice, loc)}</span>
                  )}
                  {percent > 0 && <Badge tone="success" className="mb-2">{tProduct('save', { percent })}</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted">{t('oneTime')}</p>
                {settings.offerBar.enabled && (
                  <Countdown mode={settings.offerBar.mode} endsAt={settings.offerBar.endsAt} variant="boxes" className="mt-6" />
                )}
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {product.highlights.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-ink-soft">
                      <CircleCheck className="size-[18px] shrink-0 text-emerald-500" />
                      {pickLocalized(item, loc)}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <BuyActions product={product} showMembership={false} />
                </div>
                {coupon.enabled && coupon.couponCode && (
                  <p className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 px-4 py-3 text-sm font-semibold text-brand-800">
                    <BadgePercent className="size-4" />
                    {t('useCode', { code: coupon.couponCode })}
                  </p>
                )}
              </>
            ) : (
              <p className="py-10 text-center text-muted">{t('unavailable')}</p>
            )}
          </div>
        </div>
      </section>

      {product && pickLocalized(product.description, loc) && (
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <SectionHeading title={t('included')} />
          <div className="card prose-content p-6 sm:p-10" dangerouslySetInnerHTML={{ __html: pickLocalized(product.description, loc) }} />
        </section>
      )}

      {membership.featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            title={t('includedProducts')}
            action={
              <Button asChild variant="secondary">
                <Link href="/">
                  {t('browseAll')}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {membership.featured.map((item) => (
              <Reveal key={item._id}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {settings.membershipFaq.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-6">
          <SectionHeading title={t('faq')} className="justify-center text-center" />
          <div className="space-y-3">
            {settings.membershipFaq.map((item, index) => (
              <details key={index} className="card group p-0 [&_summary::-webkit-details-marker]:hidden" open={index === 0}>
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-[15px] font-bold text-ink">
                  {pickLocalized(item.q, loc)}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition group-open:rotate-45">+</span>
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{pickLocalized(item.a, loc)}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
