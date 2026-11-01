import { getLocale, getTranslations } from 'next-intl/server';
import { LayoutGrid, SearchX, X } from 'lucide-react';
import { pickLocalized, type CategoryDTO, type Locale, type SortOption } from '@/shared';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { Reveal } from '@/components/ui/reveal';
import { Link } from '@/i18n/navigation';
import { getCategories, getProducts } from '@/lib/api';
import { cn, formatNumber } from '@/lib/utils';
import { Pagination } from './pagination';
import { ProductCard } from './product-card';
import { SortMenu } from './sort-menu';

interface CatalogViewProps {
  category?: string;
  q?: string;
  sort: SortOption;
  page: number;
}

function categoryHref(slug: string | null, sort: SortOption) {
  const base = slug ? `/category/${slug}` : '/';
  return sort !== 'default' ? `${base}?sort=${sort}` : base;
}

function CategoryList({ categories, active, sort, total, locale, allLabel }: {
  categories: CategoryDTO[];
  active?: string;
  sort: SortOption;
  total: number;
  locale: Locale;
  allLabel: string;
}) {
  const item = (isActive: boolean) =>
    cn(
      'group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] transition',
      isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink-soft hover:bg-slate-50 hover:text-brand-700',
    );
  const count = (value: number, isActive: boolean) => (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums',
        isActive ? 'bg-white text-brand-700 shadow-sm' : 'bg-slate-100 text-muted group-hover:bg-brand-100 group-hover:text-brand-700',
      )}
    >
      {formatNumber(value, locale)}
    </span>
  );

  return (
    <ul className="space-y-0.5">
      <li>
        <Link href={categoryHref(null, sort)} className={item(!active)}>
          {!active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand-700" />}
          {allLabel}
          {count(total, !active)}
        </Link>
      </li>
      {categories.map((category) => {
        const isActive = category.slug === active;
        return (
          <li key={category._id}>
            <Link href={categoryHref(category.slug, sort)} className={item(isActive)}>
              {isActive && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand-700" />}
              <span className="truncate">{pickLocalized(category.name, locale)}</span>
              {count(category.productCount, isActive)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export async function CatalogView({ category, q, sort, page }: CatalogViewProps) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('catalog');
  const [categories, { items, meta }] = await Promise.all([getCategories(), getProducts({ category, q, sort, page })]);
  const visibleCategories = categories.filter((c) => c.productCount > 0 || c.slug === category);
  const total = categories.reduce((sum, c) => sum + c.productCount, 0);
  const basePath = category ? `/category/${category}` : '/';

  return (
    <div id="products" className="mx-auto grid max-w-7xl scroll-mt-28 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[264px_1fr]">
      <aside className="hidden lg:block">
        <div className="card sticky top-28 p-5">
          <p className="px-3 text-[10.5px] font-bold uppercase tracking-[0.18em] text-muted">{t('browse')}</p>
          <h2 className="mb-4 mt-1 flex items-center gap-2 px-3 text-xl font-extrabold text-ink">
            <LayoutGrid className="size-5 text-brand-600" />
            {t('categories')}
          </h2>
          <CategoryList categories={visibleCategories} active={category} sort={sort} total={total} locale={locale} allLabel={t('allProducts')} />
        </div>
      </aside>

      <section aria-label={t('allProducts')} className="min-w-0">
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:hidden">
          {[{ slug: null as string | null, name: t('allProducts'), count: total }, ...visibleCategories.map((c) => ({ slug: c.slug, name: pickLocalized(c.name, locale), count: c.productCount }))].map(
            (chip) => {
              const isActive = (chip.slug ?? undefined) === category;
              return (
                <Link
                  key={chip.slug ?? 'all'}
                  href={categoryHref(chip.slug, sort)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition',
                    isActive ? 'border-transparent bg-brand-700 text-white shadow-glow' : 'border-line bg-white text-ink-soft',
                  )}
                >
                  {chip.name}
                  <span className={cn('text-[11px]', isActive ? 'text-white/80' : 'text-muted')}>{formatNumber(chip.count, locale)}</span>
                </Link>
              );
            },
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            {q ? (
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-ink">{t('resultsFor', { query: q })}</h2>
                <Link
                  href={basePath}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-muted transition hover:bg-red-50 hover:text-red-600"
                >
                  <X className="size-3" />
                  {t('clearSearch')}
                </Link>
              </div>
            ) : null}
            <p className="text-sm text-muted">{t('results', { count: meta.total })}</p>
          </div>
          <SortMenu value={sort} />
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title={t('emptyTitle')}
            text={t('emptyText')}
            action={
              <Button asChild variant="secondary">
                <Link href="/">{t('allProducts')}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((product, index) => (
              <Reveal key={product._id}>
                <ProductCard product={product} eager={index < 3} />
              </Reveal>
            ))}
          </div>
        )}

        <Pagination page={meta.page} pages={meta.pages} basePath={basePath} params={{ q, sort: sort !== 'default' ? sort : undefined }} />
      </section>
    </div>
  );
}
