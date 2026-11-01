import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, Crown, ReceiptText, Users, Wallet } from 'lucide-react';
import type { AdminOverviewDTO } from '@/shared';
import { OrderStatus } from '@/components/order-status';
import { Card, PageHeader, Skeleton } from '@/components/ui/misc';
import { api } from '@/lib/api';
import { cn, formatDate, formatNumber, formatPrice } from '@/lib/utils';

function Stat({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub?: string; icon: typeof Wallet; tone: string }) {
  return (
    <div className="panel relative overflow-hidden p-5">
      <div className={cn('pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-15', tone)} />
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-semibold text-muted">{label}</p>
        <span className={cn('grid size-9 place-items-center rounded-xl text-white', tone)}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-3 font-display text-[26px] font-extrabold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-muted">{sub}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p) => p.dataKey === 'revenue')?.value ?? 0;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[12px] shadow-lg">
      <p className="font-semibold text-ink">{label ? formatDate(label) : ''}</p>
      <p className="text-muted">
        Revenue <span className="font-bold text-brand-600">{formatPrice(revenue)}</span>
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => (await api.get<AdminOverviewDTO>('/admin/stats/overview')).data,
    refetchInterval: 60_000,
  });

  return (
    <>
      <PageHeader title="Dashboard" description="Sales, customers and orders at a glance." />

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[124px] rounded-2xl" />
          ))}
          <Skeleton className="h-80 rounded-2xl sm:col-span-2 xl:col-span-3" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Revenue (30 days)" value={formatPrice(data.revenue.last30)} sub={`${formatPrice(data.revenue.allTime)} all time`} icon={Wallet} tone="bg-brand-700" />
            <Stat label="Paid orders" value={formatNumber(data.orders.paid)} sub={`${formatNumber(data.orders.last30)} in the last 30 days · ${data.orders.pending} pending`} icon={ReceiptText} tone="bg-sky-500" />
            <Stat label="Customers" value={formatNumber(data.customers)} icon={Users} tone="bg-emerald-500" />
            <Stat label="Lifetime members" value={formatNumber(data.members)} icon={Crown} tone="bg-amber-500" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <Card title="Revenue" description="Paid orders over the last 30 days (Dhaka time)">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(8)} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#a78bfa', strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revenueFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Top products" description="By paid orders" bodyClassName="p-0">
              {data.topProducts.length === 0 ? (
                <p className="p-5 text-[13px] text-muted">No sales yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.topProducts.map((product, index) => (
                    <li key={product._id} className="flex items-center gap-3 px-5 py-3">
                      <span className="w-4 text-[12px] font-bold text-muted">{index + 1}</span>
                      <img src={product.thumbnail} alt="" className="h-10 w-14 rounded-md object-cover object-top ring-1 ring-line" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-ink">{product.title.en || product.title.bn}</p>
                        <p className="text-[12px] text-muted">{formatPrice(product.revenue)}</p>
                      </div>
                      <span className="text-[13px] font-bold text-ink">{product.sales}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card
            title="Recent orders"
            actions={
              <Link to="/orders" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:underline">
                View all <ArrowUpRight className="size-4" />
              </Link>
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <tbody className="divide-y divide-line">
                  {data.recentOrders.map((order) => (
                    <tr key={order._id} className="cursor-pointer transition hover:bg-hover/60" onClick={() => navigate(`/orders/${order._id}`)}>
                      <td className="px-5 py-3 font-mono text-[12.5px] font-semibold text-ink">{order.invoiceNo}</td>
                      <td className="px-5 py-3 text-ink-soft">{order.customer.name}</td>
                      <td className="px-5 py-3 text-muted">{formatDate(order.createdAt, true)}</td>
                      <td className="px-5 py-3 font-semibold text-ink">{formatPrice(order.total)}</td>
                      <td className="px-5 py-3">
                        <OrderStatus order={order} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recentOrders.length === 0 && <p className="p-5 text-[13px] text-muted">No orders yet.</p>}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
