import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserDTO } from '@/shared';
import { ApiError, api } from '@/lib/api';

/** The API sets a readable px_s cookie alongside the httpOnly session cookies. */
const hasSessionHint = () => document.cookie.split('; ').some((c) => c === 'px_s=1');

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<UserDTO | null> => {
      if (!hasSessionHint()) return null;
      try {
        return (await api.get<UserDTO>('/auth/me')).data;
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return null;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<null>('/auth/logout'),
    onSettled: () => {
      queryClient.clear();
      queryClient.setQueryData(['me'], null);
    },
  });
}
