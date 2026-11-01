import { useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Plus, Search, Star } from 'lucide-react';
import { toast } from 'sonner';
import { PRODUCT_TYPES, TECH_STACK_LABELS, type AdminProductDTO, type CategoryDTO } from '@/shared';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input, Select, Switch } from '@/components/ui/form';
import { Badge, PageHeader } from '@/components/ui/misc';
import { useDebounce } from '@/hooks/use-debounce';
import { api, errorMessage, toQuery } from '@/lib/api';
import { STOREFRONT_URL, formatNumber, formatPrice } from '@/lib/utils';

export default function ProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const search = useDebounce(q);

  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => (await api.get<CategoryDTO[]>('/admin/categories')).data,
  });

  const query = useQuery({
    queryKey: ['admin', 'products', { search, status, type, category, sort, page }],
    queryFn: () => api.get<AdminProductDTO[]>(`/admin/products${toQuery({ q: search, status, type, category, sort, page, limit: 15 })}`),
    placeholderData: keepPreviousData,
  });

  const toggleStatus = useMutation({
    mutationFn: (product: AdminProductDTO) =>
      api.patch<AdminProductDTO>(`/admin/products/${product._id}/status`, { status: product.status === 'published' ? 'draft' : 'published' }),
    onSuccess: ({ data }) => {
      toast.success(data.status === 'published' ? 'Product published' : 'Product moved to drafts');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const columns = useMemo<ColumnDef<AdminProductDTO>[]>(
    () => [
      {
        header: 'Product',
        cell: ({ row: { original: p } }) => (
          <div className="flex items-center gap-3">
            <img src={p.thumbnail} alt="" className="h-11 w-16 shrink-0 rounded-md object-cover object-top ring-1 ring-line" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-semibold text-ink">
                {p.featured && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                <span className="truncate">{p.title.en || p.title.bn}</span>
              </p>
              <p className="truncate font-mono text-[11.5px] text-muted">/{p.slug}</p>
            </div>
          </div>
        ),
      },
      {
        header: 'Category',
        cell: ({ row: { original: p } }) => (
          <div>
            <p className="text-ink-soft">{p.category?.name.en ?? '—'}</p>
            <p className="text-[11.5px] text-muted">
              {p.type.charAt(0).toUpperCase() + p.type.slice(1)} · {TECH_STACK_LABELS[p.techStack]}
            </p>
          </div>
        ),
      },
      {
        header: 'Price',
        cell: ({ row: { original: p } }) =>
          p.isFree ? (
            <Badge tone="info">Free</Badge>
          ) : (
            <div>
              <p className="font-semibold text-ink">{formatPrice(p.price)}</p>
              {p.compareAtPrice && <p className="text-[11.5px] text-muted line-through">{formatPrice(p.compareAtPrice)}</p>}
            </div>
          ),
      },
      {
        header: 'Delivery',
        cell: ({ row: { original: p } }) => (
          <div className="flex flex-wrap gap-1">
            <Badge tone={p.githubUrl ? 'success' : 'warning'}>{p.githubUrl ? 'GitHub' : 'No GitHub'}</Badge>
            {p.file && <Badge tone="brand">Zip</Badge>}
          </div>
        ),
      },
      {
        header: 'Stats',
        cell: ({ row: { original: p } }) => (
          <p className="text-[12.5px] text-muted">
            <span className="font-semibold text-ink">{formatNumber(p.sales)}</span> sales · {formatNumber(p.views)} views
          </p>
        ),
      },
      {
        header: 'Published',
        cell: ({ row: { original: p } }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch checked={p.status === 'published'} onCheckedChange={() => toggleStatus.mutate(p)} />
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row: { original: p } }) => (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {STOREFRONT_URL && p.status === 'published' && p.type !== 'membership' && (
              <Button asChild variant="ghost" size="icon-sm" aria-label="View on storefront">
                <a href={`${STOREFRONT_URL}/product/${p.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye />
                </a>
              </Button>
            )}
            <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
              <Link to={`/products/${p._id}`}>
                <Pencil />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [toggleStatus],
  );

  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Websites, plugins and the membership plan."
        actions={
          <Button asChild>
            <Link to="/products/new">
              <Plus /> New product
            </Link>
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
        onRowClick={(p) => navigate(`/products/${p._id}`)}
        emptyTitle="No products found"
        emptyText="Try changing the filters or create a new product."
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Search by title or slug" className="pl-9" />
            </div>
            <div className="w-36">
              <Select value={status} onChange={(e) => reset(() => setStatus(e.target.value))} aria-label="Status">
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </div>
            <div className="w-36">
              <Select value={type} onChange={(e) => reset(() => setType(e.target.value))} aria-label="Type">
                <option value="">All types</option>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-44">
              <Select value={category} onChange={(e) => reset(() => setCategory(e.target.value))} aria-label="Category">
                <option value="">All categories</option>
                {categories.data?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name.en || c.name.bn}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-40">
              <Select value={sort} onChange={(e) => reset(() => setSort(e.target.value))} aria-label="Sort">
                <option value="latest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="order">Storefront order</option>
                <option value="sales">Best selling</option>
                <option value="views">Most viewed</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </Select>
            </div>
          </>
        }
      />
    </>
  );
}
