import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BadgeCheck, Clock, FileBadge, Lightbulb, Mail, MapPin, Phone, Rocket } from 'lucide-react';
import { pickLocalized, type Locale } from '@/shared';
import { FacebookIcon, InstagramIcon, LinkedinIcon, MessengerIcon, TiktokIcon, WhatsappIcon, YoutubeIcon } from '@/components/layout/brand-icons';
import { HeroSwooshes } from '@/components/catalog/hero';
import { getSettings } from '@/lib/api';
import { alternatesFor } from '@/lib/seo';
import { cn, whatsappLink } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const th = await getTranslations({ locale, namespace: 'help' });
  return { title: t('helpTitle'), description: th('subtitle'), alternates: alternatesFor(locale, '/help') };
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [settings, t] = await Promise.all([getSettings(), getTranslations('help')]);
  const { contact, socials } = settings;

  const channels = [
    contact.whatsapp && {
      key: 'whatsapp',
      icon: WhatsappIcon,
      title: t('whatsapp'),
      text: t('fastest'),
      cta: t('chatWhatsapp'),
      href: whatsappLink(contact.whatsapp),
      tone: 'bg-[#25d366]',
    },
    contact.messenger && {
      key: 'messenger',
      icon: MessengerIcon,
      title: t('messenger'),
      text: contact.messenger.replace(/^https?:\/\//, ''),
      cta: t('messageUs'),
      href: contact.messenger,
      tone: 'bg-sky-600',
    },
    contact.email && {
      key: 'email',
      icon: Mail,
      title: t('email'),
      text: contact.email,
      cta: t('sendEmail'),
      href: `mailto:${contact.email}`,
      tone: 'bg-brand-700',
    },
  ].filter(Boolean) as { key: string; icon: typeof Mail; title: string; text: string; cta: string; href: string; tone: string }[];

  const details = [
    { icon: Phone, label: t('phone'), value: contact.phone },
    { icon: Clock, label: t('hours'), value: pickLocalized(contact.hours, loc) },
    { icon: MapPin, label: t('address'), value: pickLocalized(contact.address, loc) },
    { icon: FileBadge, label: t('tradeLicense'), value: contact.tradeLicense },
  ].filter((item) => item.value);

  const socialLinks = [
    { href: socials.facebook, icon: FacebookIcon, label: 'Facebook' },
    { href: socials.youtube, icon: YoutubeIcon, label: 'YouTube' },
    { href: socials.instagram, icon: InstagramIcon, label: 'Instagram' },
    { href: socials.linkedin, icon: LinkedinIcon, label: 'LinkedIn' },
    { href: socials.tiktok, icon: TiktokIcon, label: 'TikTok' },
  ].filter((item) => item.href);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-lavender">
        <HeroSwooshes className="absolute inset-0 -z-10 h-full w-full" />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <h1 className="font-display text-4xl font-extrabold text-ink sm:text-6xl">{t('title')}</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft sm:text-lg">{t('subtitle')}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {channels.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {channels.map(({ key, icon: Icon, title, text, cta, href, tone }) => (
              <a
                key={key}
                href={href}
                target={key === 'email' ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="card group p-6 transition hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className={cn('grid size-14 place-items-center rounded-2xl text-white shadow-lg', tone)}>
                  <Icon className="size-7" />
                </span>
                <h2 className="mt-5 text-lg font-bold text-ink">{title}</h2>
                <p className="mt-1 truncate text-sm text-muted">{text}</p>
                <span className="mt-5 inline-flex text-sm font-bold text-brand-700 group-hover:underline">{cta} →</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="card p-8 text-center text-muted">{t('contactSoon')}</p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-extrabold text-ink">{t('topics')}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {settings.helpTopics.map((topic, index) => (
                <li key={index} className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-ink-soft">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  {pickLocalized(topic, loc)}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <Lightbulb className="size-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold text-amber-900">{t('tipTitle')}</p>
                <p className="mt-1 text-sm text-amber-800">{t('tip')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-brand-700 p-7 text-white">
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10" />
              <Rocket className="relative size-8 text-brand-200" />
              <h2 className="relative mt-4 text-xl font-extrabold">{t('vercelTitle')}</h2>
              <p className="relative mt-2 text-sm leading-relaxed text-white/85">{t('vercelText')}</p>
            </div>

            {(details.length > 0 || socialLinks.length > 0) && (
              <div className="card p-6">
                <h2 className="font-bold text-ink">{t('supportTeam')}</h2>
                <dl className="mt-4 space-y-4">
                  {details.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
                        <dd className="text-sm font-medium text-ink">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                {socialLinks.length > 0 && (
                  <div className="mt-6 border-t border-line pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('follow')}</p>
                    <div className="mt-3 flex gap-2.5">
                      {socialLinks.map(({ href, icon: Icon, label }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-xl border border-line text-brand-700 transition hover:border-brand-200 hover:bg-brand-50">
                          <Icon className="size-[18px]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
