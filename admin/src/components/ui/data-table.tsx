import type { ReactNode } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { PaginationMeta } from '@/shared';
import { cn, formatNumber } from '@/lib/utils';
import { Button } from './button';
import { EmptyState, Skeleton } from './misc';

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[] | undefined;
  loading?: boolean;
  fetching?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyText?: string;
  emptyAction?: ReactNode;
  toolbar?: ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  fetching,
  meta,
  onPageChange,
  onRowClick,
  emptyTitle = 'Nothing here yet',
  emptyText,
  emptyAction,
  toolbar,
}: DataTableProps<T>) {
  const table = useReactTable({ data: data ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="panel overflow-hidden">
      {toolbar && <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">{toolbar}</div>}
      <div className={cn('overflow-x-auto scrollbar-thin transition-opacity', fetching && !loading && 'opacity-60')}>
        <table className="w-full min-w-[720px] text-left">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-line bg-surface-2">
                {group.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line">
            {loading
              ? Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <Skeleton className="h-4" style={{ width: `${50 + ((i + j) * 13) % 45}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              : table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn('transition-colors hover:bg-hover/60', onRowClick && 'cursor-pointer')}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle text-[13.5px] text-ink-soft">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && (data?.length ?? 0) === 0 && <EmptyState icon={<Inbox />} title={emptyTitle} text={emptyText} action={emptyAction} />}
      {meta && meta.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-[12.5px] text-muted">
          <span>
            Showing {formatNumber((meta.page - 1) * meta.limit + 1)}–{formatNumber(Math.min(meta.page * meta.limit, meta.total))} of {formatNumber(meta.total)}
          </span>
          {meta.pages > 1 && onPageChange && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="icon-sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)} aria-label="Previous page">
                <ChevronLeft />
              </Button>
              <span className="tabular-nums">
                Page {meta.page} / {meta.pages}
              </span>
              <Button variant="secondary" size="icon-sm" disabled={meta.page >= meta.pages} onClick={() => onPageChange(meta.page + 1)} aria-label="Next page">
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
