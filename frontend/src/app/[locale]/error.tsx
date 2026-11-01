'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCcw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errors');
  const tc = useTranslations('common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-red-50 text-red-600 ring-8 ring-red-50/60">
        <TriangleAlert className="size-8" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-ink">{t('errorTitle')}</h1>
      <p className="mt-3 text-muted">{t('errorText')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCcw className="size-4" />
          {tc('retry')}
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">{tc('backHome')}</Link>
        </Button>
      </div>
    </section>
  );
}
