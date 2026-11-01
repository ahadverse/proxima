import { getTranslations } from 'next-intl/server';
import { ProductCard } from '@/components/catalog/product-card';
import { ProductCardSkeleton } from '@/components/catalog/skeletons';
import { SectionHeading, Skeleton } from '@/components/ui/misc';
import { Reveal } from '@/components/ui/reveal';
import { getRelatedProducts } from '@/lib/api';

export async function RelatedProducts({ slug }: { slug: string }) {
  const [items, t] = await Promise.all([getRelatedProducts(slug), getTranslations('product')]);
  if (items.length === 0) return null;
  return (
    <section className="mt-16">
      <SectionHeading title={t('related')} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <Reveal key={product._id}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <section className="mt-16">
      <Skeleton className="mb-6 h-8 w-56" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
