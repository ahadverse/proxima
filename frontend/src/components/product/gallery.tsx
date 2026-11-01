'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, Expand, LayoutDashboard } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ProductImage } from '@/components/ui/product-image';
import { cn } from '@/lib/utils';

interface GalleryProps {
  title: string;
  images: string[];
  previewUrl: string;
  /** Public demo admin panel; empty when the product doesn't share one. */
  adminDemoUrl: string;
}

export function ProductGallery({ title, images, previewUrl, adminDemoUrl }: GalleryProps) {
  const t = useTranslations('product');
  const tc = useTranslations('common');
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const current = images[index] ?? images[0];

  return (
    <div className="card p-3 sm:p-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-2xl bg-brand-700 p-3 sm:p-6"
        aria-label={title}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative overflow-hidden rounded-xl bg-white shadow-[0_30px_60px_-25px_rgb(0_0_0/0.6)] ring-1 ring-white/30">
          <div className="flex h-7 items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 h-3.5 w-1/3 rounded-full bg-slate-200" />
          </div>
          <div className="screenshot-scroll relative aspect-[16/10] w-full">
            {current && (
              <ProductImage src={current} alt={title} fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
            )}
          </div>
        </div>
        <span className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-lg transition group-hover:opacity-100 sm:right-8 sm:top-8">
          <Expand className="size-4" />
        </span>
      </button>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto scrollbar-none">
          {images.map((image, i) => (
            <button
              key={image + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${title} ${i + 1}`}
              aria-current={i === index}
              className={cn(
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition',
                i === index ? 'ring-brand-500' : 'ring-transparent opacity-70 hover:opacity-100',
              )}
            >
              <ProductImage src={image} alt="" fill sizes="96px" className="object-cover object-top" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <a
          href={adminDemoUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!adminDemoUrl}
          className={cn(
            'flex h-12 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white text-sm font-bold text-brand-700 transition hover:bg-brand-50',
            !adminDemoUrl && 'pointer-events-none opacity-50',
          )}
        >
          <LayoutDashboard className="size-4" />
          {t('adminDemo')}
        </a>
        <a
          href={previewUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!previewUrl}
          className={cn(
            'flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-bold text-white shadow-glow transition hover:brightness-110',
            !previewUrl && 'pointer-events-none opacity-50',
          )}
        >
          <ExternalLink className="size-4" />
          {t('liveDemo')}
        </a>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent closeLabel={tc('close')} className="max-h-[90dvh] max-w-5xl overflow-hidden p-0">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="max-h-[90dvh] overflow-y-auto rounded-3xl">
            {current && (
              <ProductImage src={current} alt={title} width={1600} height={3600} sizes="(min-width: 1024px) 1024px, 100vw" className="h-auto w-full" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
