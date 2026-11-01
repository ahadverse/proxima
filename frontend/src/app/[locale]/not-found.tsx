import { useTranslations } from 'next-intl';
import { Compass } from 'lucide-react';
import { SearchBox } from '@/components/catalog/search-box';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('errors');
  const tc = useTranslations('common');
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_300px_at_50%_0%,rgb(189_158_226/0.45),transparent)]" />
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
        <span className="font-display text-[120px] font-extrabold leading-none text-brand-700 sm:text-[160px]">404</span>
        <span className="-mt-4 grid size-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-card ring-1 ring-brand-100">
          <Compass className="size-7" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold text-ink">{t('notFoundTitle')}</h1>
        <p className="mt-3 max-w-md text-muted">{t('notFoundText')}</p>
        <div className="mt-8 w-full">
          <SearchBox />
        </div>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/">{tc('backHome')}</Link>
        </Button>
      </div>
    </section>
  );
}
