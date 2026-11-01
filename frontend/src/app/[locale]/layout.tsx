import type { Metadata, Viewport } from 'next';
import { Dancing_Script, Hind_Siliguri, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Footer } from '@/components/layout/footer';
import { WhatsappButton } from '@/components/layout/floating-actions';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { OfferBar } from '@/components/layout/offer-bar';
import { PromoPopup } from '@/components/layout/promo-popup';
import { Providers } from '@/components/layout/providers';
import { routing } from '@/i18n/routing';
import { getSettings } from '@/lib/api';
import { openGraphBase } from '@/lib/seo';
import { SITE_URL } from '@/lib/utils';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-jakarta', display: 'swap' });
// Not preloaded: the browser fetches these only when a page actually renders Bengali or script text.
const bengali = Hind_Siliguri({ subsets: ['bengali'], weight: ['400', '500', '600', '700'], variable: '--font-bengali', display: 'swap', preload: false });
const dancing = Dancing_Script({ subsets: ['latin'], weight: ['700'], variable: '--font-dancing', display: 'swap', preload: false });

export const viewport: Viewport = {
  themeColor: '#6d28d9',
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  // No `alternates` here: a layout-level canonical would leak to every page that doesn't set its own.
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('homeTitle'), template: `%s | ${t('siteName')}` },
    description: t('homeDescription'),
    applicationName: t('siteName'),
    openGraph: openGraphBase(locale, t('siteName')),
    twitter: { card: 'summary_large_image' },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [settings, t, tc] = await Promise.all([
    getSettings(),
    getTranslations({ locale, namespace: 'help' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <html lang={locale} className={`${inter.variable} ${jakarta.variable} ${bengali.variable} ${dancing.variable}`}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <Providers>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
              {tc('skipToContent')}
            </a>
            <OfferBar offer={settings.offerBar} />
            <Header settings={settings} />
            <main id="main" className="min-h-[60vh]">
              {children}
            </main>
            <Footer settings={settings} />
            <MobileNav />
            <WhatsappButton number={settings.contact.whatsapp} label={t('whatsapp')} />
            <PromoPopup promo={settings.promoPopup} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
