'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Search, X } from 'lucide-react';
import type { Locale, ProductSuggestionDTO } from '@/shared';
import { pickLocalized } from '@/shared/utils';
import { Spinner } from '@/components/ui/spinner';
import { ProductImage } from '@/components/ui/product-image';
import { useRouter } from '@/i18n/navigation';
import { api } from '@/lib/client-api';
import { cn, formatPrice } from '@/lib/utils';

export function SearchBox({ initialQuery = '' }: { initialQuery?: string }) {
  const t = useTranslations('hero');
  const tc = useTranslations('common');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProductSuggestionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const { data } = await api<ProductSuggestionDTO[]>(`/products/suggest?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        setResults(data);
        setActive(-1);
      } catch {
        /* ignore aborted or failed lookups */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 280);
    return () => {
      controller.abort();
      clearTimeout(id);
    };
  }, [query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (term = query.trim()) => {
    setOpen(false);
    router.push(term ? `/?q=${encodeURIComponent(term)}#products` : '/#products');
  };

  const goTo = (slug: string) => {
    setOpen(false);
    router.push(`/product/${slug}`);
  };

  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-2xl">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (active >= 0 && results[active]) goTo(results[active].slug);
          else submit();
        }}
        className={cn(
          'flex items-center gap-2 rounded-2xl border bg-white p-2 pl-5 shadow-[0_20px_50px_-25px_rgb(85_28_150/0.45)] transition',
          open ? 'border-brand-300 ring-4 ring-brand-100' : 'border-white/80',
        )}
      >
        <Search className="size-5 shrink-0 text-brand-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (!showPanel || results.length === 0) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActive((index) => (index + 1) % results.length);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActive((index) => (index <= 0 ? results.length - 1 : index - 1));
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showPanel}
          role="combobox"
          className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-slate-400 sm:text-base"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            aria-label={tc('close')}
            className="grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
        <button
          type="submit"
          aria-label={t('search')}
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-700 text-white shadow-glow transition hover:brightness-110 active:scale-95"
        >
          {loading ? <Spinner className="size-5" /> : <Search className="size-5" />}
        </button>
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-white text-left shadow-[0_30px_60px_-25px_rgb(34_10_61/0.4)] animate-fade-up">
          {results.length > 0 ? (
            <>
              <ul id={listId} role="listbox" className="max-h-[380px] overflow-y-auto p-2">
                {results.map((item, index) => (
                  <li key={item._id} role="option" aria-selected={active === index}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => goTo(item.slug)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl p-2 text-left transition',
                        active === index ? 'bg-brand-50' : 'hover:bg-slate-50',
                      )}
                    >
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-lavender ring-1 ring-black/5">
                        <ProductImage src={item.thumbnail} alt="" fill sizes="64px" className="object-cover object-top" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{pickLocalized(item.title, locale)}</span>
                        {item.category && <span className="text-xs text-muted">{pickLocalized(item.category.name, locale)}</span>}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-brand-700">
                        {item.isFree ? tc('free') : formatPrice(item.price, locale)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => submit()}
                className="flex w-full items-center justify-center gap-1.5 border-t border-line bg-slate-50/70 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                {t('viewAll')}
                <ArrowRight className="size-4" />
              </button>
            </>
          ) : (
            <p className="px-5 py-6 text-center text-sm text-muted">{loading ? t('searching') : t('noResults', { query: query.trim() })}</p>
          )}
        </div>
      )}
    </div>
  );
}
