'use client';

import { useTranslations } from 'next-intl';
import { BadgeCheck, Crown, Gift, Library, ShoppingBag, Zap } from 'lucide-react';
import type { ProductCardDTO } from '@/shared';
import { AddToCartButton } from '@/components/catalog/add-to-cart-button';
import { Button } from '@/components/ui/button';
import { useOwnsProduct } from '@/hooks/use-library';
import { Link, useRouter } from '@/i18n/navigation';
import { useCart } from '@/stores/cart';

export function BuyActions({ product, showMembership = true }: { product: ProductCardDTO; showMembership?: boolean }) {
  const t = useTranslations('product');
  const router = useRouter();
  const add = useCart((state) => state.add);
  const owned = useOwnsProduct(product._id, product.type);

  if (owned) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
          <BadgeCheck className="size-5" />
          {t('owned')}
        </p>
        <Button asChild block size="lg" className="mt-3">
          <Link href="/account/products">
            <Library className="size-4" />
            {t('openLibrary')}
          </Link>
        </Button>
      </div>
    );
  }

  const buy = () => {
    add(product);
    router.push('/checkout');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <Button size="lg" block onClick={buy} className="h-[52px] text-[15px]">
          {product.isFree ? <Gift className="size-[18px]" /> : <ShoppingBag className="size-[18px]" />}
          {product.isFree ? t('getFree') : t('buyNow')}
        </Button>
        <AddToCartButton product={product} className="size-[52px] rounded-xl" />
      </div>
      {showMembership && product.type !== 'membership' && (
        <Button asChild variant="outline" size="lg" block className="h-[52px]">
          <Link href="/membership">
            <Crown className="size-4 text-amber-500" />
            {t('membership')}
          </Link>
        </Button>
      )}
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <Zap className="size-3.5 text-amber-500" />
        {t('instantAccess')}
      </p>
    </div>
  );
}
