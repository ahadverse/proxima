import { Skeleton } from '@/components/ui/misc';

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="p-2.5 pb-0">
        <Skeleton className="aspect-[4/3.3] w-full rounded-xl" />
      </div>
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-end justify-between pt-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="card hidden p-6 lg:block">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-6 w-32" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} className="h-4" style={{ width: `${55 + ((index * 17) % 35)}%` }} />
        ))}
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[264px_1fr]">
      <SidebarSkeleton />
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
