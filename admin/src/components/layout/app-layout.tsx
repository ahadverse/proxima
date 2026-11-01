import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { DropdownMenu } from 'radix-ui';
import {
  BadgePercent,
  ExternalLink,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ReceiptText,
  Settings,
  ShieldAlert,
  Star,
  Sun,
  Users,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/misc';
import { useLogout, useMe } from '@/hooks/use-auth';
import { STOREFRONT_URL, cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: FolderTree },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/orders', label: 'Orders', icon: ReceiptText },
      { to: '/users', label: 'Customers', icon: Users },
      { to: '/coupons', label: 'Coupons', icon: BadgePercent },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/ratings', label: 'Ratings', icon: Star },
      { to: '/video-reviews', label: 'Video reviews', icon: Video },
      { to: '/pages', label: 'Pages', icon: FileText },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('px_admin_theme', dark ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-700 text-sm font-extrabold text-white shadow-[0_8px_20px_-8px_rgb(85_28_150/0.9)]">P</span>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-extrabold text-ink">Proxima</p>
          <p className="text-[11px] text-muted">Admin panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted/80">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition',
                        isActive ? 'bg-brand-700 text-white shadow-[0_8px_18px_-10px_rgb(85_28_150/0.9)]' : 'text-ink-soft hover:bg-hover hover:text-ink',
                      )
                    }
                  >
                    <Icon className="size-[17px]" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {STOREFRONT_URL && (
        <div className="border-t border-line p-3">
          <a
            href={STOREFRONT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-hover hover:text-ink"
          >
            View storefront
            <ExternalLink className="size-4" />
          </a>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh">
        <div className="hidden w-64 border-r border-line bg-sidebar lg:block" />
        <div className="flex-1 space-y-4 p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;

  if (user.role !== 'admin') {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <div className="panel max-w-sm p-8 text-center">
          <ShieldAlert className="mx-auto size-10 text-red-500" />
          <h1 className="mt-4 text-lg font-bold text-ink">Admin access required</h1>
          <p className="mt-1 text-[13px] text-muted">{user.email} does not have permission to use the admin panel.</p>
          <Button className="mt-6" variant="secondary" onClick={() => logout.mutate(undefined, { onSettled: () => navigate('/login') })}>
            Sign in with another account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-sidebar lg:block">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-sidebar shadow-2xl animate-in">
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 grid size-8 place-items-center rounded-lg text-muted hover:bg-hover" aria-label="Close menu">
              <X className="size-4" />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-xl sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun /> : <Moon />}
            </Button>
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button type="button" className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-3 transition hover:bg-hover">
                  <span className="grid size-8 place-items-center rounded-lg bg-brand-700 text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-[13px] font-semibold text-ink">{user.name}</span>
                    <span className="block text-[11px] text-muted">{user.email}</span>
                  </span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-48 rounded-xl border border-line bg-surface p-1.5 shadow-xl animate-in">
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 outline-none data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-950/40"
                    onSelect={() =>
                      logout.mutate(undefined, {
                        onSettled: () => {
                          toast.success('Signed out');
                          navigate('/login');
                        },
                      })
                    }
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
