'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DropdownMenu, Dialog as DialogPrimitive } from 'radix-ui';
import { toast } from 'sonner';
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from 'lucide-react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { SheetContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/misc';
import { useLogout, useMe } from '@/hooks/use-auth';
import { useHydrated } from '@/hooks/use-hydrated';
import { cn, formatNumber } from '@/lib/utils';
import { useCart } from '@/stores/cart';

interface NavLink {
  href: string;
  label: string;
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/category') || pathname.startsWith('/product');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-line/80 bg-white/80 shadow-[0_8px_30px_-20px_rgb(85_28_150/0.35)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-transparent bg-white',
      )}
    >
      {children}
    </header>
  );
}

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Main">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative rounded-lg px-4 py-2 text-[14px] font-semibold transition-colors',
              active ? 'text-brand-700' : 'text-ink-soft hover:text-brand-700',
            )}
          >
            {link.label}
            <span
              className={cn(
                'absolute inset-x-4 -bottom-[3px] h-[3px] rounded-full bg-brand-700 transition-all duration-300',
                active ? 'opacity-100' : 'scale-x-0 opacity-0',
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function LanguageSwitcher({ className, onSwitch }: { className?: string; onSwitch?: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('nav');

  // Read the query string at click time; useSearchParams would opt every static page out of prerendering.
  const switchTo = (next: 'en' | 'bn') => {
    if (next === locale) return;
    router.replace(`${pathname}${window.location.search}`, { locale: next, scroll: false });
    onSwitch?.();
  };

  return (
    <div className={cn('flex items-center rounded-full border border-line bg-white p-0.5 text-xs font-bold', className)} role="group" aria-label={t('language')}>
      {(['en', 'bn'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          aria-pressed={locale === code}
          className={cn(
            'h-7 rounded-full px-2.5 transition-all',
            locale === code ? 'bg-brand-700 text-white shadow-sm' : 'text-muted hover:text-brand-700',
          )}
        >
          {code === 'en' ? 'EN' : 'বাং'}
        </button>
      ))}
    </div>
  );
}

export function CartButton() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const count = useCart((state) => state.items.length);
  const hydrated = useHydrated();

  return (
    <Link
      href="/cart"
      aria-label={t('cart')}
      className="relative grid size-10 place-items-center rounded-xl border border-line bg-white text-ink-soft transition hover:border-brand-200 hover:text-brand-700"
    >
      <ShoppingCart className="size-[18px]" />
      {hydrated && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-[10.5px] font-bold text-white ring-2 ring-white">
          {formatNumber(count, locale)}
        </span>
      )}
    </Link>
  );
}

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL;

export function AccountButton() {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const hydrated = useHydrated();

  if (!hydrated || isLoading) return <Skeleton className="h-10 w-10 rounded-xl sm:w-[132px]" />;

  if (!user) {
    return (
      <Button asChild size="sm" className="h-10 rounded-xl px-3 sm:px-4">
        <Link href="/login">
          <UserRound className="size-4" />
          <span className="hidden sm:inline">{t('signIn')}</span>
        </Link>
      </Button>
    );
  }

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const item =
    'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft outline-none transition data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-700';

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl bg-brand-700 pl-1 pr-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 sm:pr-3"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-white/20 text-xs font-bold">{initials}</span>
          <span className="hidden max-w-[110px] truncate sm:inline">{t('myAccount')}</span>
          <ChevronDown className="hidden size-4 opacity-80 sm:block" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-[70] w-60 rounded-2xl border border-line bg-white p-1.5 shadow-[0_24px_60px_-20px_rgb(34_10_61/0.35)] data-[state=open]:animate-[fade-up_0.18s_ease-out]"
        >
          <div className="px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-bold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <DropdownMenu.Separator className="mx-1 my-1 h-px bg-line" />
          <DropdownMenu.Item asChild className={item}>
            <Link href="/account">
              <LayoutGrid className="size-4" />
              {t('myAccount')}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={item}>
            <Link href="/account/products">
              <Package className="size-4" />
              {t('myProducts')}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={item}>
            <Link href="/account/orders">
              <ReceiptText className="size-4" />
              {t('orders')}
            </Link>
          </DropdownMenu.Item>
          {user.role === 'admin' && ADMIN_URL && (
            <DropdownMenu.Item asChild className={item}>
              <a href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
                <ShieldCheck className="size-4" />
                {t('adminPanel')}
              </a>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="mx-1 my-1 h-px bg-line" />
          <DropdownMenu.Item
            className={cn(item, 'data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600')}
            onSelect={() =>
              logout.mutate(undefined, {
                onSettled: () => {
                  toast.success(tAuth('signedOut'));
                  router.push('/');
                },
              })
            }
          >
            <LogOut className="size-4" />
            {t('signOut')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function MobileMenu({ links, brand }: { links: NavLink[]; brand: string }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const pathname = usePathname();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={t('menu')}
          className="grid size-10 place-items-center rounded-xl border border-line text-ink-soft transition hover:text-brand-700 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
      </DialogPrimitive.Trigger>
      <SheetContent side="left" title={brand} closeLabel={tc('close')}>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'rounded-xl px-4 py-3 text-[15px] font-semibold transition',
                isActive(pathname, link.href) ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-slate-50',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('language')}</p>
          <LanguageSwitcher onSwitch={() => setOpen(false)} />
        </div>
      </SheetContent>
    </DialogPrimitive.Root>
  );
}
