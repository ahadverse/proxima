import { Suspense } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CheckoutFailed } from '@/components/commerce/checkout-result';
import { Skeleton } from '@/components/ui/misc';

export const metadata: Metadata = { robots: { index: false } };

export default async function CheckoutFailedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="px-4 py-14 sm:py-20">
      <Suspense fallback={<Skeleton className="mx-auto h-80 max-w-xl rounded-2xl" />}>
        <CheckoutFailed />
      </Suspense>
    </div>
  );
}
