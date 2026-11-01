import { SORT_OPTIONS, type SortOption } from '@/shared/constants';

export type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseCatalogParams(params: RawSearchParams) {
  const rawSort = first(params.sort);
  const sort: SortOption = SORT_OPTIONS.includes(rawSort as SortOption) ? (rawSort as SortOption) : 'default';
  const page = Math.max(1, Math.min(1000, Number.parseInt(first(params.page) ?? '1', 10) || 1));
  const q = first(params.q)?.trim().slice(0, 80) || undefined;
  return { sort, page, q };
}
