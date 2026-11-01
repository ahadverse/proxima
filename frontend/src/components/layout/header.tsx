import { getLocale, getTranslations } from 'next-intl/server';
import { pickLocalized, type Locale, type SiteSettingsDTO } from '@/shared';
import { Link } from '@/i18n/navigation';
import { AccountButton, CartButton, HeaderShell, LanguageSwitcher, MobileMenu, NavLinks } from './header-client';
import { Logo } from './logo';

export async function Header({ settings }: { settings: SiteSettingsDTO }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('nav');
  const links = [
    { href: '/', label: t('readyWebsites') },
    { href: '/membership', label: t('membership') },
    { href: '/reviews', label: t('reviews') },
    { href: '/help', label: t('help') },
  ];
  const tagline = pickLocalized(settings.brand.tagline, locale);

  return (
    <HeaderShell>
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-4 px-4 sm:h-[74px] sm:px-6">
        <MobileMenu links={links} brand={settings.brand.name} />
        <Link href="/" className="shrink-0" aria-label={settings.brand.name}>
          <Logo name={settings.brand.name} tagline={tagline} logoUrl={settings.brand.logo} />
        </Link>
        <NavLinks links={links} />
        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <LanguageSwitcher className="hidden sm:flex" />
          <CartButton />
          <AccountButton />
        </div>
      </div>
    </HeaderShell>
  );
}
