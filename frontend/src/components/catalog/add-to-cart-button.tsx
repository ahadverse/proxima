'use client';

import { useTranslations } from 'next-intl';
import { Check, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductCardDTO } from '@/shared';
import { useHydrated } from '@/hooks/use-hydrated';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/stores/cart';

export function AddToCartButton({ product, className }: { product: ProductCardDTO; className?: string }) {
  const t = useTranslations('common');
  const router = useRouter();
  const add = useCart((state) => state.add);
  const inCart = useCart((state) => state.items.some((item) => item.id === product._id));
  const hydrated = useHydrated();
  const active = hydrated && inCart;

  return (
    <button
      type="button"
      aria-label={active ? t('viewCart') : t('addToCart')}
      title={active ? t('viewCart') : t('addToCart')}
      onClick={() => {
        if (active) {
          router.push('/cart');
          return;
        }
        add(product);
        toast.success(t('addedToCart'), {
          action: { label: t('viewCart'), onClick: () => router.push('/cart') },
        });
      }}
      className={cn(
        'grid size-9 place-items-center rounded-lg border transition-all duration-200',
        active
          ? 'border-transparent bg-brand-700 text-white shadow-glow'
          : 'border-line bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
        className,
      )}
    >
      {active ? <Check className="size-4" strokeWidth={2.6} /> : <ShoppingCart className="size-4" />}
    </button>
  );
}
