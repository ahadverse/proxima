'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Download, ExternalLink, History, KeyRound, Package, Rocket, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { LibraryItemDTO, Locale } from '@/shared';
import { TECH_STACK_LABELS } from '@/shared/constants';
import { pickLocalized } from '@/shared/utils';
import { GithubIcon } from '@/components/layout/brand-icons';
import { CopyButton } from '@/components/product/copy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, EmptyState, Skeleton } from '@/components/ui/misc';
import { ProductImage } from '@/components/ui/product-image';
import { useErrorMessage } from '@/hooks/use-error-message';
import { useLibrary } from '@/hooks/use-library';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/client-api';
import { formatBytes, formatDate } from '@/lib/utils';
import { AccountHeading } from './account-shell';

function LibraryCard({ item }: { item: LibraryItemDTO }) {
  const t = useTranslations('account.library');
  const tProduct = useTranslations('product');
  const locale = useLocale() as Locale;
  const { message } = useErrorMessage();
  const [showChangelog, setShowChangelog] = useState(false);
  const title = pickLocalized(item.product.title, locale);

  const download = useMutation({
    mutationFn: () => api<{ url: string }>(`/library/${item.product._id}/download`),
    onSuccess: ({ data }) => {
      toast.success(t('downloadStarted'));
      window.location.assign(data.url);
    },
    onError: (error) => toast.error(message(error)),
  });

  const sourceTone = item.source === 'membership' ? 'brand' : item.source === 'free' ? 'neutral' : 'success';

  return (
    <article className="card overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[260px_1fr]">
        <Link href={`/product/${item.product.slug}`} className="screenshot-scroll relative block aspect-[16/10] bg-lavender md:aspect-auto md:min-h-full">
          <ProductImage src={item.product.thumbnail} alt={title} fill sizes="(min-width: 768px) 260px, 100vw" className="object-cover" />
        </Link>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={sourceTone} size="sm">
              {t(`source.${item.source}`)}
            </Badge>
            {item.product.version && (
              <Badge tone="neutral" size="sm">
                {t('version', { version: item.product.version })}
              </Badge>
            )}
            <Badge tone="neutral" size="sm">
              {TECH_STACK_LABELS[item.product.techStack]}
            </Badge>
            <span className="ml-auto text-xs text-muted">{t('acquired', { date: formatDate(item.acquiredAt, locale) })}</span>
          </div>
          <h2 className="mt-3 text-lg font-extrabold leading-snug text-ink">
            <Link href={`/product/${item.product.slug}`} className="hover:text-brand-700">
              {title}
            </Link>
          </h2>

          <div className="mt-4 rounded-2xl border border-line bg-slate-50/70 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <GithubIcon className="size-4 text-ink" />
              {t('github')}
            </p>
            {item.githubUrl ? (
              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={item.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate rounded-lg border border-line bg-white px-3 py-2 font-mono text-[13px] text-brand-700 hover:underline"
                >
                  {item.githubUrl.replace(/^https?:\/\//, '')}
                </a>
                <CopyButton value={item.githubUrl} label={t('copyLink')} className="size-9" />
                <Button asChild size="sm" variant="dark" className="h-9">
                  <a href={item.githubUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                    <span className="hidden sm:inline">{t('openGithub')}</span>
                  </a>
                </Button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">{t('githubPending')}</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {item.hasFile && (
              <Button size="sm" loading={download.isPending} onClick={() => download.mutate()}>
                <Download className="size-4" />
                {download.isPending ? t('preparing') : t('download')}
                {item.fileSize > 0 && <span className="font-normal opacity-75">· {formatBytes(item.fileSize)}</span>}
              </Button>
            )}
            {item.product.previewUrl && (
              <Button asChild size="sm" variant="secondary">
                <a href={item.product.previewUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  {tProduct('liveDemo')}
                </a>
              </Button>
            )}
            {item.product.changelog.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setShowChangelog((v) => !v)} aria-expanded={showChangelog}>
                <History className="size-4" />
                {t('changelog')}
              </Button>
            )}
          </div>

          {item.demoAdmin && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-brand-800">
                <KeyRound className="size-4" />
                {t('demo')}
              </span>
              {item.demoAdmin.email && (
                <span className="flex items-center gap-1.5 font-mono text-xs text-ink-soft">
                  {item.demoAdmin.email}
                  <CopyButton value={item.demoAdmin.email} className="size-7" />
                </span>
              )}
              {item.demoAdmin.password && (
                <span className="flex items-center gap-1.5 font-mono text-xs text-ink-soft">
                  {item.demoAdmin.password}
                  <CopyButton value={item.demoAdmin.password} className="size-7" />
                </span>
              )}
              {item.demoAdmin.url && (
                <a href={item.demoAdmin.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs font-semibold text-brand-700 hover:underline">
                  {tProduct('openDemoAdmin')}
                </a>
              )}
            </div>
          )}

          {showChangelog && (
            <ol className="mt-4 space-y-3 border-l-2 border-brand-100 pl-4 animate-fade-up">
              {item.product.changelog.map((entry) => (
                <li key={entry.version + entry.date} className="text-sm">
                  <p className="font-semibold text-ink">
                    v{entry.version} <span className="font-normal text-muted">· {formatDate(entry.date, locale)}</span>
                  </p>
                  {pickLocalized(entry.notes, locale) && <p className="text-muted">{pickLocalized(entry.notes, locale)}</p>}
                </li>
              ))}
            </ol>
          )}

          {item.product.type === 'website' && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line pt-4">
              <p className="flex items-center gap-2 text-sm text-muted">
                <Rocket className="size-4 text-brand-500" />
                <span>
                  <span className="font-semibold text-ink">{t('vercel')}</span> {t('vercelText')}
                </span>
              </p>
              <Link href="/help" className="text-sm font-semibold text-brand-700 hover:underline">
                {t('requestSetup')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function LibraryView() {
  const t = useTranslations('account');
  const tCart = useTranslations('cart');
  const locale = useLocale() as Locale;
  const { data, isLoading } = useLibrary();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter((item) => pickLocalized(item.product.title, locale).toLowerCase().includes(term));
  }, [data, query, locale]);

  return (
    <>
      <AccountHeading
        title={t('products')}
        subtitle={t('library.subtitle')}
        action={
          data && data.length > 3 ? (
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('library.search')} className="h-10 pl-10 text-sm" />
            </div>
          ) : null
        }
      />
      {isLoading ? (
        <div className="space-y-5">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      ) : !data?.length ? (
        <EmptyState
          icon={<Package />}
          title={t('library.empty')}
          text={t('library.emptyText')}
          action={
            <Button asChild>
              <Link href="/">{tCart('browse')}</Link>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="card p-8 text-center text-sm text-muted">{t('library.noMatch')}</p>
      ) : (
        <div className="space-y-5">
          {filtered.map((item) => (
            <LibraryCard key={item.product._id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
