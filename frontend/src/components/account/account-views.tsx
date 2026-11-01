'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, ChevronLeft, ChevronRight, Crown, Handshake, Package, ReceiptText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Locale, OrderDTO } from '@/shared';
import { pickLocalized } from '@/shared/utils';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Skeleton } from '@/components/ui/misc';
import { ProductImage } from '@/components/ui/product-image';
import { useMe } from '@/hooks/use-auth';
import { useErrorMessage } from '@/hooks/use-error-message';
import { useLibrary } from '@/hooks/use-library';
import { useMyOrder, useMyOrders } from '@/hooks/use-orders';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/client-api';
import { formatDate, formatNumber, formatPrice } from '@/lib/utils';
import { AccountHeading } from './account-shell';
import { OrderStatusBadge } from './order-status-badge';

function PayButton({ order }: { order: OrderDTO }) {
  const t = useTranslations('account.ordersPage');
  const { message } = useErrorMessage();
  const mutation = useMutation({
    mutationFn: () => api<{ paymentUrl: string }>(`/orders/${order.invoiceNo}/pay`, { method: 'POST' }),
    onSuccess: ({ data }) => window.location.assign(data.paymentUrl),
    onError: (error) => toast.error(message(error)),
  });
  if ((order.status !== 'pending' && order.status !== 'failed') || order.isExpired || order.total === 0) return null;
  return (
    <Button size="sm" loading={mutation.isPending} onClick={() => mutation.mutate()}>
      {t('pay')}
    </Button>
  );
}

function OrdersTable({ orders }: { orders: OrderDTO[] }) {
  const t = useTranslations('account.ordersPage');
  const locale = useLocale() as Locale;
  return (
    <div className="card overflow-hidden">
      <div className="hidden grid-cols-[1.2fr_1fr_1.6fr_0.8fr_0.9fr_auto] gap-4 border-b border-line bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted md:grid">
        <span>{t('invoice')}</span>
        <span>{t('date')}</span>
        <span>{t('items')}</span>
        <span>{t('total')}</span>
        <span>{t('status')}</span>
        <span className="w-24" />
      </div>
      <ul className="divide-y divide-line">
        {orders.map((order) => (
          <li key={order._id} className="grid gap-2 px-5 py-4 md:grid-cols-[1.2fr_1fr_1.6fr_0.8fr_0.9fr_auto] md:items-center md:gap-4">
            <Link href={`/account/orders/${order.invoiceNo}`} className="font-mono text-sm font-bold text-ink hover:text-brand-700">
              {order.invoiceNo}
            </Link>
            <span className="text-sm text-muted">{formatDate(order.createdAt, locale)}</span>
            <span className="line-clamp-1 text-sm text-ink-soft">{order.items.map((item) => pickLocalized(item.title, locale)).join(', ')}</span>
            <span className="text-sm font-bold text-ink">{formatPrice(order.total, locale)}</span>
            <span>
              <OrderStatusBadge order={order} />
            </span>
            <span className="flex w-24 justify-end gap-2">
              <PayButton order={order} />
              {(order.status === 'paid' || order.isExpired || order.status === 'cancelled' || order.status === 'refunded' || order.total === 0) && (
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/account/orders/${order.invoiceNo}`}>{t('view')}</Link>
                </Button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AccountOverview() {
  const t = useTranslations('account');
  const locale = useLocale() as Locale;
  const { data: user } = useMe();
  const { data: library, isLoading: libraryLoading } = useLibrary();
  const { data: orders, isLoading: ordersLoading } = useMyOrders(1, 5);
  if (!user) return null;

  const stats = [
    { label: t('statProducts'), value: libraryLoading ? null : formatNumber(library?.length ?? 0, locale), icon: Package, href: '/account/products' },
    { label: t('statOrders'), value: ordersLoading ? null : formatNumber(orders?.meta?.total ?? 0, locale), icon: ReceiptText, href: '/account/orders' },
    {
      label: t('statMembership'),
      value: user.membership.active ? t('memberActive') : t('notMember'),
      icon: Crown,
      href: '/account/membership',
    },
  ];

  return (
    <>
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-brand-700 p-7 text-white sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10" />
        <p className="relative text-sm font-semibold text-white/70">{t('overview')}</p>
        <h1 className="relative mt-1 text-3xl font-extrabold">{t('hello', { name: user.name.split(' ')[0] })}</h1>
        <p className="relative mt-2 max-w-lg text-white/80">{t('overviewText')}</p>
        {user.membership.active && user.membership.activatedAt && (
          <Badge tone="dark" className="relative mt-5 bg-white/15 ring-1 ring-white/25">
            <Crown className="size-3.5 text-amber-300" />
            {t('memberSince', { date: formatDate(user.membership.activatedAt, locale) })}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-700 group-hover:text-white">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
              {value === null ? <Skeleton className="mt-1 h-6 w-12" /> : <p className="truncate text-xl font-extrabold text-ink">{value}</p>}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <AccountHeading
          title={t('latestOrders')}
          action={
            <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              {t('viewAll')}
              <ArrowRight className="size-4" />
            </Link>
          }
        />
        {ordersLoading ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : orders?.data.length ? (
          <OrdersTable orders={orders.data} />
        ) : (
          <EmptyState icon={<ReceiptText />} title={t('noOrders')} />
        )}
      </div>
    </>
  );
}

export function OrdersView() {
  const t = useTranslations('account');
  const tCatalog = useTranslations('catalog');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useMyOrders(page, 10);
  const pages = data?.meta?.pages ?? 1;

  return (
    <>
      <AccountHeading title={t('orders')} />
      {isLoading ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : data?.data.length ? (
        <div className={isFetching ? 'opacity-70 transition' : 'transition'}>
          <OrdersTable orders={data.data} />
          {pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" />
                {tCatalog('previous')}
              </Button>
              <span className="text-sm text-muted">{tCatalog('pageOf', { page, pages })}</span>
              <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                {tCatalog('next')}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState icon={<ReceiptText />} title={t('noOrders')} />
      )}
    </>
  );
}

export function OrderDetailView({ invoiceNo }: { invoiceNo: string }) {
  const t = useTranslations('account.ordersPage');
  const tCart = useTranslations('cart');
  const tStatus = useTranslations('account.status');
  const locale = useLocale() as Locale;
  const { data: order, isLoading, error } = useMyOrder(invoiceNo);

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (error || !order) {
    return <EmptyState icon={<ReceiptText />} title={t('invoice')} text={invoiceNo} action={<Link href="/account/orders">{t('back')}</Link>} />;
  }

  return (
    <>
      <Link href="/account/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ChevronLeft className="size-4" />
        {t('back')}
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('invoice')}</p>
              <p className="font-mono text-xl font-extrabold text-ink">{order.invoiceNo}</p>
              <p className="mt-1 text-sm text-muted">{formatDate(order.createdAt, locale, { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge order={order} />
              <PayButton order={order} />
            </div>
          </div>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.product} className="flex items-center gap-4 py-4">
                <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-lavender ring-1 ring-black/5">
                  {item.thumbnail && <ProductImage src={item.thumbnail} alt="" fill sizes="80px" className="object-cover object-top" />}
                </span>
                <Link href={`/product/${item.slug}`} className="line-clamp-2 flex-1 text-sm font-semibold text-ink hover:text-brand-700">
                  {pickLocalized(item.title, locale)}
                </Link>
                <span className="text-sm font-bold text-ink">{formatPrice(item.price, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">{tCart('subtotal')}</span>
              <span className="font-semibold">{formatPrice(order.subtotal, locale)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">
                  {tCart('discount')} {order.coupon && <span className="font-mono text-xs">({order.coupon.code})</span>}
                </span>
                <span className="font-semibold text-emerald-600">−{formatPrice(order.discount, locale)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-base">
              <span className="font-bold text-ink">{tCart('total')}</span>
              <span className="font-extrabold text-brand-700">{formatPrice(order.total, locale)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-ink">{t('payment')}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {order.payment.method && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t('method')}</dt>
                  <dd className="font-semibold text-ink">{order.payment.method}</dd>
                </div>
              )}
              {order.payment.trxId && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t('trx')}</dt>
                  <dd className="break-all font-mono text-xs text-ink">{order.payment.trxId}</dd>
                </div>
              )}
              {order.payment.paidAt && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t('paidAt')}</dt>
                  <dd className="font-semibold text-ink">{formatDate(order.payment.paidAt, locale)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('customer')}</dt>
                <dd className="text-right font-semibold text-ink">
                  {order.customer.name}
                  <span className="block text-xs font-normal text-muted">{order.customer.phone}</span>
                </dd>
              </div>
            </dl>
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-ink">{t('timeline')}</h2>
            <ol className="mt-4 space-y-4 border-l-2 border-brand-100 pl-5">
              {order.statusHistory.map((entry, index) => (
                <li key={index} className="relative text-sm">
                  <span className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white bg-brand-500" />
                  <p className="font-semibold text-ink">{tStatus(entry.status)}</p>
                  <p className="text-xs text-muted">{formatDate(entry.at, locale, { hour: '2-digit', minute: '2-digit' })}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}

export function MembershipStatusView() {
  const t = useTranslations('account.membershipPage');
  const tAccount = useTranslations('account');
  const locale = useLocale() as Locale;
  const { data: user } = useMe();
  if (!user) return null;
  const active = user.membership.active;

  return (
    <>
      <AccountHeading title={tAccount('membership')} />
      <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 ${active ? 'bg-brand-700 text-white' : 'card'}`}>
        {active && <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10" />}
        <span className={`relative grid size-14 place-items-center rounded-2xl ${active ? 'bg-white/15 ring-1 ring-white/25' : 'bg-brand-50 text-brand-600'}`}>
          <Crown className={`size-7 ${active ? 'text-amber-300' : ''}`} />
        </span>
        <h2 className={`relative mt-6 text-2xl font-extrabold ${active ? '' : 'text-ink'}`}>{active ? t('activeTitle') : t('inactiveTitle')}</h2>
        <p className={`relative mt-2 max-w-xl ${active ? 'text-white/85' : 'text-muted'}`}>{active ? t('activeText') : t('inactiveText')}</p>
        {active && user.membership.activatedAt && (
          <p className="relative mt-4 text-sm font-semibold text-white/75">{tAccount('memberSince', { date: formatDate(user.membership.activatedAt, locale) })}</p>
        )}
        <div className="relative mt-7">
          {active ? (
            <Button asChild variant="secondary">
              <Link href="/account/products">
                <Package className="size-4" />
                {tAccount('products')}
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/membership">
                <Sparkles className="size-4" />
                {t('cta')}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export function AffiliateView() {
  const t = useTranslations('account.affiliatePage');
  return (
    <>
      <AccountHeading title={t('title')} />
      <EmptyState icon={<Handshake />} title={t('soon')} text={t('text')} />
    </>
  );
}
