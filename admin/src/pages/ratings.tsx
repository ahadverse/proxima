import { useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RatingDTO } from '@/shared';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useConfirm } from '@/components/ui/dialog';
import { Select } from '@/components/ui/form';
import { Badge, PageHeader } from '@/components/ui/misc';
import { api, errorMessage, toQuery } from '@/lib/api';
import { formatDate } from '@/lib/utils';

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={i < value ? 'size-3.5 fill-amber-400 text-amber-400' : 'size-3.5 text-slate-300 dark:text-slate-600'} />
      ))}
    </span>
  );
}

export default function RatingsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['admin', 'ratings', { status, page }],
    queryFn: () => api.get<RatingDTO[]>(`/admin/ratings${toQuery({ status, page, limit: 20 })}`),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'ratings'] });

  const setRatingStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'approved' | 'hidden' }) => api.patch(`/admin/ratings/${id}`, { status: next }),
    onSuccess: () => {
      toast.success('Rating updated');
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/ratings/${id}`),
    onSuccess: () => {
      toast.success('Rating deleted');
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const columns = useMemo<ColumnDef<RatingDTO>[]>(
    () => [
      {
        header: 'Product',
        cell: ({ row: { original: r } }) => (
          <div className="flex items-center gap-2.5">
            {r.product?.thumbnail && <img src={r.product.thumbnail} alt="" className="h-9 w-12 rounded object-cover object-top ring-1 ring-line" />}
            <span className="max-w-[200px] truncate font-medium text-ink">{r.product?.title.en || r.product?.title.bn || '—'}</span>
          </div>
        ),
      },
      { header: 'Customer', cell: ({ row: { original: r } }) => <span>{r.user?.name ?? '—'}</span> },
      { header: 'Rating', cell: ({ row: { original: r } }) => <Stars value={r.stars} /> },
      {
        header: 'Comment',
        cell: ({ row: { original: r } }) => <p className="max-w-[340px] text-[13px] leading-snug text-ink-soft">{r.comment || <span className="text-muted">No comment</span>}</p>,
      },
      { header: 'Status', cell: ({ row: { original: r } }) => <Badge tone={r.status === 'approved' ? 'success' : 'neutral'} dot className="capitalize">{r.status}</Badge> },
      { header: 'Date', cell: ({ row: { original: r } }) => <span className="text-[12.5px] text-muted">{formatDate(r.createdAt)}</span> },
      {
        id: 'actions',
        header: '',
        cell: ({ row: { original: r } }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={r.status === 'approved' ? 'Hide' : 'Approve'}
              title={r.status === 'approved' ? 'Hide' : 'Approve'}
              onClick={() => setRatingStatus.mutate({ id: r._id, next: r.status === 'approved' ? 'hidden' : 'approved' })}
            >
              {r.status === 'approved' ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              variant="danger-ghost"
              size="icon-sm"
              aria-label="Delete"
              onClick={async () => {
                if (await confirm({ title: 'Delete this rating?', description: 'The product rating average is recalculated.', confirmLabel: 'Delete' })) remove.mutate(r._id);
              }}
            >
              <Trash2 />
            </Button>
          </div>
        ),
      },
    ],
    [confirm, remove, setRatingStatus],
  );

  return (
    <>
      <PageHeader title="Ratings" description="Verified buyer ratings. Hidden ratings are excluded from averages." />
      <DataTable
        columns={columns}
        data={query.data?.data}
        meta={query.data?.meta}
        loading={query.isLoading}
        fetching={query.isFetching}
        onPageChange={setPage}
        emptyTitle="No ratings yet"
        toolbar={
          <div className="w-40">
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
              <option value="">All ratings</option>
              <option value="approved">Visible</option>
              <option value="hidden">Hidden</option>
            </Select>
          </div>
        }
      />
    </>
  );
}
