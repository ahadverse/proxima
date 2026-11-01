'use client';

import { useTranslations } from 'next-intl';
import { House, LifeBuoy, ShoppingCart, UserRound } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useHydrated } from '@/hooks/use-hydrated';
import { cn } from '@/lib/utils';
import { useCart } from '@/stores/cart';

export function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const count = useCart((state) => state.items.length);
  const hydrated = useHydrated();

  const items = [
    { href: '/', label: t('home'), icon: House, active: pathname === '/' },
    { href: '/cart', label: t('cart'), icon: ShoppingCart, active: pathname === '/cart', badge: hydrated ? count : 0 },
    { href: '/help', label: t('help'), icon: LifeBuoy, active: pathname === '/help' },
    { href: '/account', label: t('account'), icon: UserRound, active: pathname.startsWith('/account') },
  ];

  return (
    <nav
      aria-label={t('menu')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, icon: Icon, active, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn('relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition', active ? 'text-brand-700' : 'text-muted')}
          >
            {active && <span className="absolute inset-x-6 top-0 h-[3px] rounded-b-full bg-brand-700" />}
            <span className="relative">
              <Icon className="size-[21px]" strokeWidth={active ? 2.4 : 2} />
              {badge ? (
                <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-700 px-1 text-[9.5px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </span>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
