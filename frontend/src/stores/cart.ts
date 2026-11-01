'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Localized, ProductCardDTO, ProductType } from '@/shared';

export interface CartItem {
  id: string;
  slug: string;
  type: ProductType;
  title: Localized;
  thumbnail: string;
  price: number;
  compareAtPrice: number | null;
  isFree: boolean;
}

interface CartState {
  items: CartItem[];
  couponCode: string;
  add: (product: ProductCardDTO) => void;
  remove: (id: string) => void;
  removeMany: (ids: string[]) => void;
  clear: () => void;
  setCoupon: (code: string) => void;
}

const memory = new Map<string, string>();

/** localStorage can throw in private browsing; fall back to memory so the cart still works. */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      memory.set(name, value);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      memory.delete(name);
    }
  },
};

export function toCartItem(product: ProductCardDTO): CartItem {
  return {
    id: product._id,
    slug: product.slug,
    type: product.type,
    title: product.title,
    thumbnail: product.thumbnail,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    isFree: product.isFree,
  };
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: '',
      add: (product) =>
        set((state) =>
          state.items.some((item) => item.id === product._id)
            ? state
            : { items: [...state.items, toCartItem(product)] },
        ),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      removeMany: (ids) => set((state) => ({ items: state.items.filter((item) => !ids.includes(item.id)) })),
      clear: () => set({ items: [], couponCode: '' }),
      setCoupon: (code) => set({ couponCode: code.trim().toUpperCase() }),
    }),
    {
      name: 'px_cart',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode }),
    },
  ),
);
