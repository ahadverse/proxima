'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { OrderDTO } from '@/shared';
import { api } from '@/lib/client-api';
import { useMe } from './use-auth';

export function useMyOrders(page = 1, limit = 10) {
  const { data: user } = useMe();
  return useQuery({
    queryKey: ['orders', user?._id, page, limit],
    queryFn: () => api<OrderDTO[]>(`/orders/mine?page=${page}&limit=${limit}`),
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
  });
}

export function useMyOrder(invoiceNo: string) {
  const { data: user } = useMe();
  return useQuery({
    queryKey: ['order', invoiceNo],
    queryFn: async () => (await api<OrderDTO>(`/orders/mine/${encodeURIComponent(invoiceNo)}`)).data,
    enabled: Boolean(user && invoiceNo),
  });
}
