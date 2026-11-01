import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { couponInputSchema, type AdminProductDTO, type CouponDTO, type CouponInput } from '@/shared';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, useConfirm } from '@/components/ui/dialog';
import { Field, Input, Select, Switch } from '@/components/ui/form';
import { Badge, PageHeader } from '@/components/ui/misc';
import { useDebounce } from '@/hooks/use-debounce';
import { ApiError, api, errorMessage, fieldMessage, toQuery } from '@/lib/api';
import { formatDate, formatPrice, fromLocalInput, toLocalInput } from '@/lib/utils';

const EMPTY: CouponInput = {
  code: '',
  type: 'percent',
  value: 10,
  maxDiscount: null,
  minAmount: 0,
  appliesTo: 'all',
  products: [],
  maxUses: null,
  perUserLimit: null,
  startsAt: null,
  endsAt: null,
  isActive: true,
};

function numberOrNull(value: string) {
  return value === '' ? null : Number(value);
}

function CouponDialog({ open, onOpenChange, coupon }: { open: boolean; onOpenChange: (open: boolean) => void; coupon: CouponDTO | null }) {
  const queryClient = useQueryClient();
  const form = useForm<CouponInput>({ resolver: zodResolver(couponInputSchema), defaultValues: EMPTY });
  const { register, control, handleSubmit, reset, setError, formState } = form;
  const { errors } = formState;
  const [type, appliesTo] = useWatch({ control, name: ['type', 'appliesTo'] });

  const products = useQuery({
    queryKey: ['admin', 'products', 'all-for-coupons'],
    queryFn: async () => (await api.get<AdminProductDTO[]>('/admin/products?limit=100&sort=order')).data,
    enabled: open && appliesTo === 'products',
  });

  useEffect(() => {
    if (!open) return;
    reset(
      coupon
        ? {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            maxDiscount: coupon.maxDiscount,
            minAmount: coupon.minAmount,
            appliesTo: coupon.appliesTo,
            products: coupon.products,
            maxUses: coupon.maxUses,
            perUserLimit: coupon.perUserLimit,
            startsAt: coupon.startsAt,
            endsAt: coupon.endsAt,
            isActive: coupon.isActive,
          }
        : EMPTY,
    );
  }, [open, coupon, reset]);

  const save = useMutation({
    mutationFn: (values: CouponInput) => (coupon ? api.put(`/admin/coupons/${coupon._id}`, values) : api.post('/admin/coupons', values)),
    onSuccess: () => {
      toast.success(coupon ? 'Coupon updated' : 'Coupon created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) error.errors.forEach((e) => setError(e.path as never, { message: e.message }));
      else toast.error(errorMessage(error));
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={coupon ? `Edit ${coupon.code}` : 'New coupon'}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>
            Save coupon
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="Code" htmlFor="code" required error={fieldMessage(errors.code?.message)}>
          <Input id="code" className="font-mono uppercase" {...register('code')} />
        </Field>
        <Field label="Discount type" htmlFor="type">
          <Select id="type" {...register('type')}>
            <option value="percent">Percentage</option>
            <option value="fixed">Fixed amount (৳)</option>
          </Select>
        </Field>
        <Field label={type === 'percent' ? 'Percent off' : 'Amount off (৳)'} htmlFor="value" required error={fieldMessage(errors.value?.message)}>
          <Input id="value" type="number" min={1} {...register('value', { valueAsNumber: true })} />
        </Field>
        <Controller
          control={control}
          name="maxDiscount"
          render={({ field }) => (
            <Field label="Maximum discount (৳)" htmlFor="maxDiscount" hint="Leave empty for no cap">
              <Input id="maxDiscount" type="number" min={1} value={field.value ?? ''} onChange={(e) => field.onChange(numberOrNull(e.target.value))} />
            </Field>
          )}
        />
        <Field label="Applies to" htmlFor="appliesTo">
          <Select id="appliesTo" {...register('appliesTo')}>
            <option value="all">All products</option>
            <option value="membership">Membership only</option>
            <option value="products">Specific products</option>
          </Select>
        </Field>
        <Field label="Minimum order (৳)" htmlFor="minAmount">
          <Input id="minAmount" type="number" min={0} {...register('minAmount', { valueAsNumber: true })} />
        </Field>
        {appliesTo === 'products' && (
          <Controller
            control={control}
            name="products"
            render={({ field, fieldState }) => (
              <Field label="Products" className="sm:col-span-2" error={fieldMessage(fieldState.error?.message)}>
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
                  {products.data?.map((p) => (
                    <label key={p._id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-hover">
                      <input
                        type="checkbox"
                        className="size-4 accent-brand-600"
                        checked={field.value.includes(p._id)}
                        onChange={(e) => field.onChange(e.target.checked ? [...field.value, p._id] : field.value.filter((id) => id !== p._id))}
                      />
                      {p.title.en || p.title.bn}
                    </label>
                  ))}
                </div>
              </Field>
            )}
          />
        )}
        <Controller
          control={control}
          name="maxUses"
          render={({ field }) => (
            <Field label="Total uses allowed" htmlFor="maxUses" hint="Empty means unlimited">
              <Input id="maxUses" type="number" min={1} value={field.value ?? ''} onChange={(e) => field.onChange(numberOrNull(e.target.value))} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="perUserLimit"
          render={({ field }) => (
            <Field label="Uses per customer" htmlFor="perUserLimit" hint="Empty means unlimited">
              <Input id="perUserLimit" type="number" min={1} value={field.value ?? ''} onChange={(e) => field.onChange(numberOrNull(e.target.value))} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="startsAt"
          render={({ field }) => (
            <Field label="Starts" htmlFor="startsAt" hint="Dhaka time, optional">
              <Input id="startsAt" type="datetime-local" value={toLocalInput(field.value)} onChange={(e) => field.onChange(fromLocalInput(e.target.value))} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="endsAt"
          render={({ field, fieldState }) => (
            <Field label="Ends" htmlFor="endsAt" hint="Dhaka time, optional" error={fieldMessage(fieldState.error?.message)}>
              <Input id="endsAt" type="datetime-local" value={toLocalInput(field.value)} onChange={(e) => field.onChange(fromLocalInput(e.target.value))} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <div className="sm:col-span-2">
              <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} label="Active" description="Inactive coupons cannot be applied." />
            </div>
          )}
        />
      </form>
    </Dialog>
  );
}

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ open: boolean; coupon: CouponDTO | null }>({ open: false, coupon: null });
  const search = useDebounce(q);

  const query = useQuery({
    queryKey: ['admin', 'coupons', { search, page }],
    queryFn: () => api.get<CouponDTO[]>(`/admin/coupons${toQuery({ q: search, page, limit: 20 })}`),
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const columns = useMemo<ColumnDef<CouponDTO>[]>(
    () => [
      { header: 'Code', cell: ({ row: { original: c } }) => <span className="font-mono font-bold text-ink">{c.code}</span> },
      {
        header: 'Discount',
        cell: ({ row: { original: c } }) => (
          <span className="font-semibold text-ink">
            {c.type === 'percent' ? `${c.value}%` : formatPrice(c.value)}
            {c.maxDiscount ? <span className="font-normal text-muted"> (max {formatPrice(c.maxDiscount)})</span> : null}
          </span>
        ),
      },
      { header: 'Applies to', cell: ({ row: { original: c } }) => <span className="capitalize">{c.appliesTo === 'products' ? `${c.products.length} products` : c.appliesTo}</span> },
      { header: 'Used', cell: ({ row: { original: c } }) => <span className="tabular-nums">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</span> },
      {
        header: 'Valid',
        cell: ({ row: { original: c } }) => (
          <span className="text-[12.5px] text-muted">{c.startsAt || c.endsAt ? `${formatDate(c.startsAt)} – ${formatDate(c.endsAt)}` : 'Always'}</span>
        ),
      },
      {
        header: 'Status',
        cell: ({ row: { original: c } }) => {
          const expired = c.endsAt && new Date(c.endsAt) < new Date();
          return <Badge tone={!c.isActive ? 'neutral' : expired ? 'danger' : 'success'} dot>{!c.isActive ? 'Inactive' : expired ? 'Expired' : 'Active'}</Badge>;
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row: { original: c } }) => (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon-sm" onClick={() => setDialog({ open: true, coupon: c })} aria-label="Edit">
              <Pencil />
            </Button>
            <Button
              variant="danger-ghost"
              size="icon-sm"
              aria-label="Delete"
              onClick={async () => {
                if (await confirm({ title: `Delete ${c.code}?`, description: 'Existing orders keep their discount.', confirmLabel: 'Delete' })) remove.mutate(c._id);
              }}
            >
              <Trash2 />
            </Button>
          </div>
        ),
      },
    ],
    [confirm, remove],
  );

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Discount codes customers can apply in the cart."
        actions={
          <Button onClick={() => setDialog({ open: true, coupon: null })}>
            <Plus /> New coupon
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={query.data?.data}
        meta={query.data?.meta}
        loading={query.isLoading}
        fetching={query.isFetching}
        onPageChange={setPage}
        onRowClick={(c) => setDialog({ open: true, coupon: c })}
        emptyTitle="No coupons yet"
        toolbar={
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search codes" className="pl-9" />
          </div>
        }
      />
      <CouponDialog open={dialog.open} coupon={dialog.coupon} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
    </>
  );
}
