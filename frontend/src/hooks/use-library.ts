'use client';

import { useQuery } from '@tanstack/react-query';
import type { LibraryItemDTO } from '@/shared';
import { api } from '@/lib/client-api';
import { useMe } from './use-auth';

export function useLibrary() {
  const { data: user } = useMe();
  return useQuery({
    queryKey: ['library', user?._id],
    queryFn: async () => (await api<LibraryItemDTO[]>('/library')).data,
    enabled: Boolean(user),
    staleTime: 60 * 1000,
  });
}

/** Whether the signed-in user already owns a product, used to swap buy buttons for library links. */
export function useOwnsProduct(productId: string, type?: string) {
  const { data: user } = useMe();
  const { data: library } = useLibrary();
  if (!user) return false;
  if (type === 'membership') return user.membership.active;
  if (user.membership.active && (type === 'website' || type === 'plugin')) return true;
  return Boolean(library?.some((item) => item.product._id === productId));
}
