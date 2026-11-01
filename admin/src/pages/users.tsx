import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Crown, Search } from 'lucide-react';
import type { UserDTO } from '@/shared';
import { DataTable } from '@/components/ui/data-table';
import { Input, Select } from '@/components/ui/form';
import { Badge, PageHeader } from '@/components/ui/misc';
import { useDebounce } from '@/hooks/use-debounce';
import { api, toQuery } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function UsersPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [membership, setMembership] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounce(q);

  const query = useQuery({
    queryKey: ['admin', 'users', { search, role, membership, page }],
    queryFn: () => api.get<UserDTO[]>(`/admin/users${toQuery({ q: search, role, membership, page, limit: 20 })}`),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<ColumnDef<UserDTO>[]>(
    () => [
      {
        header: 'Customer',
        cell: ({ row: { original: u } }) => (
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">{u.name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{u.name}</p>
              <p className="truncate text-[12px] text-muted">{u.email}</p>
            </div>
          </div>
        ),
      },
      { header: 'Phone', cell: ({ row: { original: u } }) => <span className="text-[13px]">{u.phone || '—'}</span> },
      {
        header: 'Membership',
        cell: ({ row: { original: u } }) =>
          u.membership.active ? (
            <Badge tone="warning">
              <Crown className="size-3" /> Lifetime
            </Badge>
          ) : (
            <span className="text-[12.5px] text-muted">—</span>
          ),
      },
      {
        header: 'Role',
        cell: ({ row: { original: u } }) => (
          <div className="flex gap-1">
            <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'} className="capitalize">
              {u.role}
            </Badge>
            {u.isBanned && <Badge tone="danger">Banned</Badge>}
          </div>
        ),
      },
      { header: 'Joined', cell: ({ row: { original: u } }) => <span className="text-[12.5px] text-muted">{formatDate(u.createdAt)}</span> },
      { header: 'Last sign-in', cell: ({ row: { original: u } }) => <span className="text-[12.5px] text-muted">{formatDate(u.lastLoginAt, true)}</span> },
    ],
    [],
  );

  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Customers" description="Accounts, memberships and access." />
      <DataTable
        columns={columns}
        data={query.data?.data}
        meta={query.data?.meta}
        loading={query.isLoading}
        fetching={query.isFetching}
        onPageChange={setPage}
        onRowClick={(u) => navigate(`/users/${u._id}`)}
        emptyTitle="No customers found"
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Name, email or phone" className="pl-9" />
            </div>
            <div className="w-36">
              <Select value={role} onChange={(e) => reset(() => setRole(e.target.value))} aria-label="Role">
                <option value="">All roles</option>
                <option value="user">Customers</option>
                <option value="admin">Admins</option>
              </Select>
            </div>
            <div className="w-40">
              <Select value={membership} onChange={(e) => reset(() => setMembership(e.target.value))} aria-label="Membership">
                <option value="">Any membership</option>
                <option value="active">Members</option>
                <option value="none">Non-members</option>
              </Select>
            </div>
          </>
        }
      />
    </>
  );
}
