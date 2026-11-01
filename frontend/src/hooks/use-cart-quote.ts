'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { CartQuoteDTO } from '@/shared';
import { api } from '@/lib/client-api';
import { useHydrated } from './use-hydrated';
import { useMe } from './use-auth';
import { useCart } from '@/stores/cart';

/** Server-priced view of the cart. Prices in local storage are only used as a placeholder. */
export function useCartQuote() {
  const items = useCart((state) => state.items);
  const couponCode = useCart((state) => state.couponCode);
  const hydrated = useHydrated();
  const { data: user, isLoading: userLoading } = useMe();
  const ids = items.map((item) => item.id);

  const query = useQuery({
    queryKey: ['cart-quote', ids, couponCode, user?._id ?? null],
    queryFn: async () =>
      (await api<CartQuoteDTO>('/cart/quote', { method: 'POST', body: { items: ids, couponCode: couponCode || undefined } })).data,
    enabled: hydrated && !userLoading && ids.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });

  return { ...query, hydrated, items, couponCode };
}
