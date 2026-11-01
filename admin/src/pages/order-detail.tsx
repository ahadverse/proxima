import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Ban, CircleCheck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { OrderDTO } from '@/shared';
import { OrderStatus } from '@/components/order-status';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, Textarea } from '@/components/ui/form';
import { Card, Skeleton } from '@/components/ui/misc';
import { api, errorMessage } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';

type Action = 'paid' | 'cancelled' | 'refunded';

const ACTIONS: Record<Action, { title: string; description: string; label: string; variant: 'success' | 'danger' | 'primary' }> = {
  paid: {
    title: 'Mark order as paid',
    description: 'Use this only after confirming the payment manually. The customer gets access immediately.',
    label: 'Mark as paid',
    variant: 'success',
  },
  cancelled: { title: 'Cancel order', description: 'The order will be closed and can no longer be paid.', label: 'Cancel order', variant: 'danger' },
  refunded: {
    title: 'Refund order',
    description: 'Access to the products in this order is removed. Membership granted by this order is revoked. Send the money back through the payment provider separately.',
    label: 'Mark as refunded',
    variant: 'danger',
  },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: async () => (await api.get<OrderDTO>(`/admin/orders/${id}`)).data,
  });

  const update = useMutation({
    mutationFn: (status: Action) => api.patch<OrderDTO>(`/admin/orders/${id}/status`, { status, note }),
    onSuccess: ({ data }) => {
      toast.success('Order updated');
      queryClient.setQueryData(['admin', 'order', id], data);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      setAction(null);
      setNote('');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const user = typeof order.user === 'object' ? order.user : null;
  const canPay = (order.status === 'pending' || order.status === 'failed') && order.total > 0;
  const canCancel = order.status === 'pending' || order.status === 'failed';
  const canRefund = order.status === 'paid';

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Back">
          <Link to="/orders">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-mono text-xl font-extrabold text-ink">{order.invoiceNo}</h1>
          <p className="text-[13px] text-muted">Placed {formatDate(order.createdAt, true)}</p>
        </div>
        <OrderStatus order={order} />
        {canPay && (
          <Button variant="success" onClick={() => setAction('paid')}>
            <CircleCheck /> Mark paid
          </Button>
        )}
        {canCancel && (
          <Button variant="secondary" onClick={() => setAction('cancelled')}>
            <Ban /> Cancel
          </Button>
        )}
        {canRefund && (
          <Button variant="danger-ghost" onClick={() => setAction('refunded')}>
            <RotateCcw /> Refund
          </Button>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card title="Items" bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.product} className="flex items-center gap-4 px-5 py-3.5">
                  <img src={item.thumbnail} alt="" className="h-12 w-16 rounded-md object-cover object-top ring-1 ring-line" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${item.product}`} className="font-semibold text-ink hover:text-brand-600">
                      {item.title.en || item.title.bn}
                    </Link>
                    <p className="text-[12px] capitalize text-muted">{item.type}</p>
                  </div>
                  <span className="font-semibold text-ink">{formatPrice(item.price)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line px-5 py-4 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount {order.coupon && <span className="font-mono">({order.coupon.code})</span>}</dt>
                  <dd className="text-emerald-600">−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <dt className="text-ink">Total</dt>
                <dd className="text-ink">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Timeline">
            <ol className="space-y-4 border-l-2 border-line pl-5">
              {order.statusHistory.map((entry, index) => (
                <li key={index} className="relative">
                  <span className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-surface bg-brand-500" />
                  <p className="text-[13.5px] font-semibold capitalize text-ink">{entry.status}</p>
                  {entry.note && <p className="text-[13px] text-ink-soft">{entry.note}</p>}
                  <p className="text-[12px] text-muted">{formatDate(entry.at, true)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            <dl className="space-y-3 text-[13.5px]">
              <div>
                <dt className="text-[12px] text-muted">Name</dt>
                <dd className="font-semibold text-ink">{order.customer.name}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-muted">Email</dt>
                <dd className="text-ink">{order.customer.email}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-muted">Phone</dt>
                <dd className="text-ink">{order.customer.phone}</dd>
              </div>
              {user && (
                <Link to={`/users/${user._id}`} className="inline-block text-[13px] font-semibold text-brand-600 hover:underline">
                  View customer profile →
                </Link>
              )}
            </dl>
          </Card>
          <Card title="Payment">
            <dl className="space-y-3 text-[13.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Provider</dt>
                <dd className="capitalize text-ink">{order.payment.provider ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Method</dt>
                <dd className="text-ink">{order.payment.method || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Transaction ID</dt>
                <dd className="break-all text-right font-mono text-[12px] text-ink">{order.payment.trxId || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Amount received</dt>
                <dd className="text-ink">{order.payment.amount ? formatPrice(order.payment.amount) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Paid at</dt>
                <dd className="text-ink">{formatDate(order.payment.paidAt, true)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <Dialog
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
        title={action ? ACTIONS[action].title : ''}
        description={action ? ACTIONS[action].description : undefined}
        footer={
          action && (
            <>
              <Button variant="secondary" onClick={() => setAction(null)}>
                Back
              </Button>
              <Button variant={ACTIONS[action].variant} loading={update.isPending} onClick={() => update.mutate(action)}>
                {ACTIONS[action].label}
              </Button>
            </>
          )
        }
      >
        <Field label="Internal note" htmlFor="note" hint="Saved in the order timeline.">
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
        </Field>
      </Dialog>
    </>
  );
}
