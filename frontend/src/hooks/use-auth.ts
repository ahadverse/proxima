'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserDTO } from '@/shared';
import { ApiClientError, api, hasSessionHint } from '@/lib/client-api';

export const meQueryKey = ['me'] as const;

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async (): Promise<UserDTO | null> => {
      if (!hasSessionHint()) return null;
      try {
        return (await api<UserDTO>('/auth/me')).data;
      } catch (error) {
        if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) return null;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api<null>('/auth/logout', { method: 'POST' }),
    onSettled: () => {
      queryClient.setQueryData(meQueryKey, null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' });
    },
  });
}
