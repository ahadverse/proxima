import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { pickLocalized, type Locale, type SiteSettingsDTO } from '@/shared';
import { Link } from '@/i18n/navigation';
import { whatsappLink } from '@/lib/utils';
import { FacebookIcon, InstagramIcon, LinkedinIcon, TiktokIcon, WhatsappIcon, YoutubeIcon } from './brand-icons';
import { Logo } from './logo';

export async function Footer({ settings }: { settings: SiteSettingsDTO }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const { brand, socials, contact, hostingPromo } = settings;

  const socialLinks = [
    { href: socials.facebook, label: 'Facebook', icon: FacebookIcon },
    { href: socials.youtube, label: 'YouTube', icon: YoutubeIcon },
    { href: contact.whatsapp ? whatsappLink(contact.whatsapp) : '', label: 'WhatsApp', icon: WhatsappIcon },
    { href: socials.instagram, label: 'Instagram', icon: InstagramIcon },
    { href: socials.linkedin, label: 'LinkedIn', icon: LinkedinIcon },
    { href: socials.tiktok, label: 'TikTok', icon: TiktokIcon },
  ].filter((item) => item.href);

  const quickLinks = [
    { href: '/membership', label: tNav('membership') },
    { href: '/p/about', label: t('about') },
    { href: '/help', label: tNav('help') },
    { href: '/p/setup-guide', label: t('setupGuide') },
  ];
  const resources = [
    { href: '/account/affiliate', label: t('affiliate') },
    { href: '/p/delivery-policy', label: t('delivery') },
    { href: '/p/terms', label: t('terms') },
    { href: '/p/refund-policy', label: t('refund') },
  ];

  const heading = (text: string) => (
    <h3 className="mb-5 flex items-center gap-2.5 text-[15px] font-bold text-ink">
      <span className="h-4 w-[3px] rounded-full bg-brand-700" />
      {text}
    </h3>
  );
  const linkClass = 'group inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-brand-700';

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-white pb-24 lg:pb-0">
      <svg className="pointer-events-none absolute -top-10 right-0 h-[520px] w-[900px] text-brand-200/60" viewBox="0 0 900 520" fill="none" aria-hidden="true">
        <path d="M900 40C700 60 520 180 430 330S260 520 0 500" stroke="currentColor" strokeWidth="1.5" />
        <path d="M900 120C720 140 580 240 500 380S320 540 60 540" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.2fr]">
        <div>
          <Link href="/" aria-label={brand.name}>
            <Logo name={brand.name} tagline={pickLocalized(brand.tagline, locale)} logoUrl={brand.logo} />
          </Link>
          {pickLocalized(brand.footerAbout, locale) && (
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{pickLocalized(brand.footerAbout, locale)}</p>
          )}
          {socialLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-xl border border-line bg-white text-brand-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
                >
                  <Icon className="size-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          {heading(t('quickLinks'))}
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {heading(t('resources'))}
          <ul className="space-y-3">
            {resources.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          {hostingPromo.enabled && hostingPromo.url && (
            <div>
              {heading(pickLocalized(hostingPromo.title, locale))}
              <p className="mb-4 text-sm text-muted">{pickLocalized(hostingPromo.text, locale)}</p>
              <a
                href={hostingPromo.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group flex h-12 items-center justify-between rounded-xl bg-brand-700 px-5 text-sm font-bold text-white shadow-glow transition hover:brightness-110"
              >
                {pickLocalized(hostingPromo.ctaLabel, locale)}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          )}
          <div>
            {heading(t('securePayments'))}
            {settings.paymentLogos ? (
              <div className="rounded-xl border border-line bg-white p-3 shadow-sm">
                <Image src={settings.paymentLogos} alt={t('securePayments')} width={420} height={120} className="h-auto w-full" unoptimized />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 text-sm font-medium text-ink-soft shadow-sm">
                <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
                {t('payments')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative border-t border-line/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-[13px] text-muted sm:flex-row sm:px-6">
          <p>{t('rights', { year: new Date().getFullYear(), brand: brand.name })}</p>
          <p>{t('madeIn')}</p>
        </div>
      </div>
    </footer>
  );
}
