import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Ban, Crown, ShieldCheck, ShieldOff, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminUserDetailDTO, UserDTO } from '@/shared';
import { OrderStatus } from '@/components/order-status';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/dialog';
import { Badge, Card, Skeleton } from '@/components/ui/misc';
import { useMe } from '@/hooks/use-auth';
import { api, errorMessage } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: me } = useMe();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: async () => (await api.get<AdminUserDetailDTO>(`/admin/users/${id}`)).data,
  });

  const onDone = (message: string) => ({
    onSuccess: ({ data: user }: { data: UserDTO }) => {
      toast.success(message);
      queryClient.setQueryData<AdminUserDetailDTO>(['admin', 'user', id], (old) => (old ? { ...old, user } : old));
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: unknown) => toast.error(errorMessage(error)),
  });

  const update = useMutation({ mutationFn: (body: { role?: string; isBanned?: boolean }) => api.patch<UserDTO>(`/admin/users/${id}`, body), ...onDone('Customer updated') });
  const membership = useMutation({
    mutationFn: (action: 'grant' | 'revoke') => api.post<UserDTO>(`/admin/users/${id}/membership`, { action }),
    ...onDone('Membership updated'),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const { user, orders, stats } = data;
  const isSelf = me?._id === user._id;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft />
        </Button>
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-700 text-lg font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-ink">{user.name}</h1>
          <p className="text-[13px] text-muted">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.isBanned && <Badge tone="danger">Banned</Badge>}
          <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'} className="capitalize">
            {user.role}
          </Badge>
          {user.membership.active && (
            <Badge tone="warning">
              <Crown className="size-3" /> Lifetime member
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card title="Orders" description={`${stats.paidOrders} paid · ${formatPrice(stats.spent)} spent`} bodyClassName="p-0">
          {orders.length === 0 ? (
            <p className="p-5 text-[13px] text-muted">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((order) => (
                <li key={order._id}>
                  <Link to={`/orders/${order._id}`} className="flex flex-wrap items-center gap-4 px-5 py-3 transition hover:bg-hover/60">
                    <span className="font-mono text-[12.5px] font-semibold text-ink">{order.invoiceNo}</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">{order.items.map((i) => i.title.en || i.title.bn).join(', ')}</span>
                    <span className="text-[13px] font-semibold text-ink">{formatPrice(order.total)}</span>
                    <OrderStatus order={order} />
                    <span className="text-[12px] text-muted">{formatDate(order.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Details">
            <dl className="space-y-3 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-muted">Phone</dt>
                <dd className="text-ink">{user.phone || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Joined</dt>
                <dd className="text-ink">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Last sign-in</dt>
                <dd className="text-ink">{formatDate(user.lastLoginAt, true)}</dd>
              </div>
              {user.membership.activatedAt && (
                <div className="flex justify-between">
                  <dt className="text-muted">Member since</dt>
                  <dd className="text-ink">{formatDate(user.membership.activatedAt)}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Actions">
            <div className="space-y-2.5">
              {user.membership.active ? (
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  loading={membership.isPending}
                  onClick={async () => {
                    if (await confirm({ title: 'Revoke membership?', description: 'The customer loses access to products unlocked by membership.', confirmLabel: 'Revoke' })) membership.mutate('revoke');
                  }}
                >
                  <Crown /> Revoke membership
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  loading={membership.isPending}
                  onClick={async () => {
                    if (await confirm({ title: 'Grant lifetime membership?', description: 'The customer gets every website and plugin immediately.', confirmLabel: 'Grant', tone: 'primary' })) membership.mutate('grant');
                  }}
                >
                  <Crown /> Grant membership
                </Button>
              )}
              {!isSelf &&
                (user.role === 'admin' ? (
                  <Button variant="secondary" className="w-full justify-start" loading={update.isPending} onClick={() => update.mutate({ role: 'user' })}>
                    <ShieldOff /> Remove admin access
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    loading={update.isPending}
                    onClick={async () => {
                      if (await confirm({ title: 'Make this user an admin?', description: 'Admins can manage products, orders, customers and settings.', confirmLabel: 'Make admin', tone: 'primary' })) update.mutate({ role: 'admin' });
                    }}
                  >
                    <ShieldCheck /> Make admin
                  </Button>
                ))}
              {!isSelf &&
                (user.isBanned ? (
                  <Button variant="secondary" className="w-full justify-start" loading={update.isPending} onClick={() => update.mutate({ isBanned: false })}>
                    <UserCheck /> Unban
                  </Button>
                ) : (
                  <Button
                    variant="danger-ghost"
                    className="w-full justify-start"
                    loading={update.isPending}
                    onClick={async () => {
                      if (await confirm({ title: 'Ban this customer?', description: 'They are signed out everywhere and lose access to downloads.', confirmLabel: 'Ban' })) update.mutate({ isBanned: true });
                    }}
                  >
                    <Ban /> Ban customer
                  </Button>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
