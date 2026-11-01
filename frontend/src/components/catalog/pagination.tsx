import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn, formatNumber } from '@/lib/utils';

function pageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | 'gap')[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1]! > 1) result.push('gap');
    result.push(page);
  });
  return result;
}

interface PaginationProps {
  page: number;
  pages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}

export function Pagination({ page, pages, basePath, params }: PaginationProps) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  if (pages <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
    if (target > 1) search.set('page', String(target));
    else search.delete('page');
    const query = search.toString();
    return `${basePath}${query ? `?${query}` : ''}#products`;
  };

  const base = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-semibold transition';
  const idle = 'border border-line bg-white text-ink-soft hover:border-brand-200 hover:text-brand-700';

  return (
    <nav className="mt-12 flex flex-col items-center gap-3" aria-label={t('pageOf', { page, pages })}>
      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link href={href(page - 1)} className={cn(base, idle)} aria-label={t('previous')}>
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span className={cn(base, 'border border-line bg-white text-slate-300')} aria-hidden="true">
            <ChevronLeft className="size-4" />
          </span>
        )}
        {pageList(page, pages).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-muted">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={href(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(base, item === page ? 'bg-brand-700 text-white shadow-glow' : idle)}
            >
              {formatNumber(item, locale)}
            </Link>
          ),
        )}
        {page < pages ? (
          <Link href={href(page + 1)} className={cn(base, idle)} aria-label={t('next')}>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className={cn(base, 'border border-line bg-white text-slate-300')} aria-hidden="true">
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>
      <p className="text-xs text-muted">{t('pageOf', { page: formatNumber(page, locale), pages: formatNumber(pages, locale) })}</p>
    </nav>
  );
}
