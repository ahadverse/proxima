import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Flag, Search } from 'lucide-react';
import { ORDER_STATUSES, type OrderDTO } from '@/shared';
import { OrderStatus } from '@/components/order-status';
import { DataTable } from '@/components/ui/data-table';
import { Input, Select } from '@/components/ui/form';
import { Badge, PageHeader } from '@/components/ui/misc';
import { useDebounce } from '@/hooks/use-debounce';
import { api, toQuery } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounce(q);

  const query = useQuery({
    queryKey: ['admin', 'orders', { search, status, flagged, from, to, page }],
    queryFn: () => api.get<OrderDTO[]>(`/admin/orders${toQuery({ q: search, status, flagged, from, to, page, limit: 20 })}`),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<ColumnDef<OrderDTO>[]>(
    () => [
      {
        header: 'Invoice',
        cell: ({ row: { original: o } }) => <span className="font-mono text-[12.5px] font-semibold text-ink">{o.invoiceNo}</span>,
      },
      {
        header: 'Customer',
        cell: ({ row: { original: o } }) => (
          <div>
            <p className="font-medium text-ink">{o.customer.name}</p>
            <p className="text-[12px] text-muted">{o.customer.email}</p>
          </div>
        ),
      },
      {
        header: 'Items',
        cell: ({ row: { original: o } }) => (
          <p className="max-w-[260px] truncate text-[13px]">{o.items.map((i) => i.title.en || i.title.bn).join(', ')}</p>
        ),
      },
      {
        header: 'Total',
        cell: ({ row: { original: o } }) => (
          <div>
            <p className="font-semibold text-ink">{formatPrice(o.total)}</p>
            {o.coupon && <p className="font-mono text-[11px] text-muted">{o.coupon.code}</p>}
          </div>
        ),
      },
      { header: 'Status', cell: ({ row: { original: o } }) => <OrderStatus order={o} /> },
      { header: 'Payment', cell: ({ row: { original: o } }) => <span className="text-[12.5px] capitalize text-muted">{o.payment.provider ?? '—'}</span> },
      { header: 'Date', cell: ({ row: { original: o } }) => <span className="whitespace-nowrap text-[12.5px] text-muted">{formatDate(o.createdAt, true)}</span> },
    ],
    [],
  );

  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Orders" description="Every checkout, including free claims and pending payments." />
      <DataTable
        columns={columns}
        data={query.data?.data}
        meta={query.data?.meta}
        loading={query.isLoading}
        fetching={query.isFetching}
        onPageChange={setPage}
        onRowClick={(o) => navigate(`/orders/${o._id}`)}
        emptyTitle="No orders found"
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Invoice, name, email or phone" className="pl-9" />
            </div>
            <div className="w-36">
              <Select value={status} onChange={(e) => reset(() => setStatus(e.target.value))} aria-label="Status">
                <option value="">All statuses</option>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            <Input type="date" value={from} onChange={(e) => reset(() => setFrom(e.target.value))} className="w-40" aria-label="From date" />
            <Input type="date" value={to} onChange={(e) => reset(() => setTo(e.target.value))} className="w-40" aria-label="To date" />
            <button
              type="button"
              onClick={() => reset(() => setFlagged((f) => !f))}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-semibold text-ink-soft transition hover:bg-hover"
              aria-pressed={flagged}
            >
              <Flag className="size-4" />
              {flagged ? <Badge tone="danger">Needs review</Badge> : 'Needs review'}
            </button>
          </>
        }
      />
    </>
  );
}
