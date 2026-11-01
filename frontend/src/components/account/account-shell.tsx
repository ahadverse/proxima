'use client';

import { useEffect, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Crown, Handshake, LayoutGrid, Package, ReceiptText, UserRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/misc';
import { useMe } from '@/hooks/use-auth';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function AccountShell({ children }: { children: ReactNode }) {
  const t = useTranslations('account');
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useMe();

  useEffect(() => {
    if (!isLoading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isLoading, user, pathname, router]);

  const links = [
    { href: '/account', label: t('overview'), icon: LayoutGrid, exact: true },
    { href: '/account/products', label: t('products'), icon: Package },
    { href: '/account/orders', label: t('orders'), icon: ReceiptText },
    { href: '/account/membership', label: t('membership'), icon: Crown },
    { href: '/account/profile', label: t('profile'), icon: UserRound },
    { href: '/account/affiliate', label: t('affiliate'), icon: Handshake },
  ];

  if (isLoading || !user) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[250px_1fr]">
        <Skeleton className="hidden h-80 rounded-2xl lg:block" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[250px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="card hidden p-4 lg:block">
          <div className="flex items-center gap-3 border-b border-line px-2 pb-4">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-700 font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <nav className="mt-3 space-y-0.5">
            {links.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                    active ? 'bg-brand-700 text-white shadow-glow' : 'text-ink-soft hover:bg-brand-50 hover:text-brand-700',
                  )}
                >
                  <Icon className="size-[18px]" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none lg:hidden">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition',
                  active ? 'border-transparent bg-brand-700 text-white' : 'border-line bg-white text-ink-soft',
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function AccountHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
