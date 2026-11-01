'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { CircleCheckBig, CircleX, Clock4, Library, LifeBuoy, RefreshCcw, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import type { Locale, OrderDTO } from '@/shared';
import { pickLocalized } from '@/shared/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/misc';
import { Spinner } from '@/components/ui/spinner';
import { useMe } from '@/hooks/use-auth';
import { useErrorMessage } from '@/hooks/use-error-message';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/client-api';
import { cn, formatPrice } from '@/lib/utils';
import { useCart } from '@/stores/cart';

const POLL_LIMIT = 20;

function OrderLines({ order }: { order: OrderDTO }) {
  const t = useTranslations('checkout.success');
  const tCart = useTranslations('cart');
  const locale = useLocale() as Locale;
  return (
    <div className="mt-8 rounded-2xl border border-line bg-slate-50/60 p-5 text-left">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{t('invoice')}</span>
        <span className="font-mono font-bold text-ink">{order.invoiceNo}</span>
      </div>
      <ul className="mt-4 space-y-2 border-t border-line pt-4">
        {order.items.map((item) => (
          <li key={item.product} className="flex items-center justify-between gap-3 text-sm">
            <span className="line-clamp-1 text-ink-soft">{pickLocalized(item.title, locale)}</span>
            <span className="font-semibold text-ink">{formatPrice(item.price, locale)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="font-semibold text-ink">{tCart('total')}</span>
        <span className="text-lg font-extrabold text-brand-700">{formatPrice(order.total, locale)}</span>
      </div>
    </div>
  );
}

function ResultIcon({ tone }: { tone: 'success' | 'pending' | 'failed' }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    pending: 'bg-brand-50 text-brand-600 ring-brand-100',
    failed: 'bg-red-50 text-red-600 ring-red-100',
  }[tone];
  return (
    <span className={cn('mx-auto grid size-20 animate-pop place-items-center rounded-full ring-[10px]', styles)}>
      {tone === 'success' && <CircleCheckBig className="size-10" />}
      {tone === 'pending' && <Clock4 className="size-10" />}
      {tone === 'failed' && <CircleX className="size-10" />}
    </span>
  );
}

export function CheckoutSuccess() {
  const t = useTranslations('checkout.success');
  const tNav = useTranslations('nav');
  const invoice = useSearchParams().get('invoice') ?? '';
  const { data: user, isLoading: userLoading } = useMe();
  const clear = useCart((state) => state.clear);
  const queryClient = useQueryClient();
  const polls = useRef(0);

  const query = useQuery({
    queryKey: ['order', invoice],
    queryFn: async () => {
      polls.current += 1;
      return (await api<OrderDTO>(`/orders/mine/${encodeURIComponent(invoice)}?verify=1`)).data;
    },
    enabled: Boolean(user && invoice),
    refetchInterval: (q) => (q.state.data?.status === 'pending' && polls.current < POLL_LIMIT ? 3000 : false),
  });

  const order = query.data;
  const paid = order?.status === 'paid';

  useEffect(() => {
    if (paid) {
      clear();
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  }, [paid, clear, queryClient]);

  if (userLoading || (user && query.isLoading)) {
    return (
      <div className="card mx-auto max-w-xl p-10">
        <Skeleton className="mx-auto size-20 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-7 w-64" />
        <Skeleton className="mx-auto mt-3 h-4 w-80" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <ResultIcon tone="pending" />
        <h1 className="mt-6 text-2xl font-extrabold text-ink">{t('processingTitle')}</h1>
        <Button asChild className="mt-6">
          <Link href={`/login?next=${encodeURIComponent(`/checkout/success?invoice=${invoice}`)}`}>{tNav('signIn')}</Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  if (!paid && order.status !== 'pending') {
    return <CheckoutFailed fallbackInvoice={invoice} />;
  }

  const stillWaiting = order.status === 'pending' && polls.current >= POLL_LIMIT;

  return (
    <div className="card relative mx-auto max-w-xl overflow-hidden p-8 text-center sm:p-10">
      {paid && <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(400px_160px_at_50%_0%,rgb(16_185_129/0.18),transparent)]" />}
      <ResultIcon tone={paid ? 'success' : 'pending'} />
      <h1 className="mt-6 text-2xl font-extrabold text-ink sm:text-3xl">{paid ? t('title') : t('processingTitle')}</h1>
      <p className="mt-2 text-muted">{paid ? t('text') : stillWaiting ? t('stillProcessing') : t('processingText')}</p>
      {!paid && !stillWaiting && <Spinner className="mx-auto mt-5 size-6 text-brand-600" />}
      <OrderLines order={order} />
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {paid ? (
          <Button asChild block size="lg">
            <Link href="/account/products">
              <Library className="size-4" />
              {t('openLibrary')}
            </Link>
          </Button>
        ) : (
          <Button block size="lg" variant="secondary" loading={query.isFetching} onClick={() => query.refetch()}>
            <RefreshCcw className="size-4" />
            {t('checkAgain')}
          </Button>
        )}
        <Button asChild block size="lg" variant="secondary">
          <Link href={`/account/orders/${order.invoiceNo}`}>{t('viewOrder')}</Link>
        </Button>
      </div>
    </div>
  );
}

export function CheckoutFailed({ fallbackInvoice }: { fallbackInvoice?: string }) {
  const t = useTranslations('checkout.failed');
  const tNav = useTranslations('nav');
  const params = useSearchParams();
  const invoice = params.get('invoice') ?? fallbackInvoice ?? '';
  const reason = params.get('reason') ?? 'failed';
  const { message } = useErrorMessage();
  const { data: user } = useMe();

  const retry = useMutation({
    mutationFn: () => api<{ paymentUrl: string }>(`/orders/${encodeURIComponent(invoice)}/pay`, { method: 'POST' }),
    onSuccess: ({ data }) => window.location.assign(data.paymentUrl),
    onError: (error) => toast.error(message(error)),
  });

  const known = ['cancelled', 'failed', 'review', 'closed', 'not_found'];
  const text = t(known.includes(reason) ? (reason as 'failed') : 'failed');
  const canRetry = Boolean(invoice && user) && (reason === 'cancelled' || reason === 'failed');

  return (
    <div className="card mx-auto max-w-xl p-8 text-center sm:p-10">
      <ResultIcon tone={reason === 'review' ? 'pending' : 'failed'} />
      <h1 className="mt-6 text-2xl font-extrabold text-ink sm:text-3xl">{t('title')}</h1>
      <p className="mt-2 text-muted">{text}</p>
      {invoice && <p className="mt-4 font-mono text-sm font-semibold text-ink-soft">{invoice}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {canRetry ? (
          <Button block size="lg" loading={retry.isPending} onClick={() => retry.mutate()}>
            <RefreshCcw className="size-4" />
            {t('retry')}
          </Button>
        ) : (
          <Button asChild block size="lg">
            <Link href="/cart">
              <ShoppingCart className="size-4" />
              {tNav('cart')}
            </Link>
          </Button>
        )}
        <Button asChild block size="lg" variant="secondary">
          <Link href="/help">
            <LifeBuoy className="size-4" />
            {t('contact')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
