'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Copy, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Locale, SiteSettingsDTO } from '@/shared';
import { pickLocalized } from '@/shared/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Link, usePathname } from '@/i18n/navigation';

const STORAGE_KEY = 'px_promo_seen';
const DAY_MS = 24 * 60 * 60 * 1000;

function seenRecently(): boolean {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Boolean(value) && Date.now() - value < DAY_MS;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* storage unavailable */
  }
}

export function PromoPopup({ promo }: { promo: SiteSettingsDTO['promoPopup'] }) {
  const t = useTranslations('promo');
  const tc = useTranslations('common');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const blocked = pathname.startsWith('/checkout') || pathname.startsWith('/membership') || pathname.startsWith('/account');

  useEffect(() => {
    if (!promo.enabled || !promo.couponCode || blocked || seenRecently()) return;
    const id = setTimeout(() => {
      setOpen(true);
      markSeen();
    }, promo.delaySeconds * 1000);
    return () => clearTimeout(id);
  }, [promo.enabled, promo.couponCode, promo.delaySeconds, blocked]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(promo.couponCode);
      setCopied(true);
      toast.success(t('copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent closeLabel={tc('close')} className="max-w-md overflow-hidden">
        <div className="relative overflow-hidden bg-brand-700 px-7 pb-8 pt-9 text-white">
          <div className="pointer-events-none absolute -right-14 -top-14 size-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-white/25">
            <Sparkles className="size-3.5" />
            {t('badge')}
          </span>
          <div className="relative mt-5 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Crown className="size-6 text-amber-300" />
            </span>
            <DialogTitle className="font-display text-2xl font-extrabold leading-tight">{pickLocalized(promo.title, locale)}</DialogTitle>
          </div>
          <DialogDescription className="relative mt-3 text-[15px] leading-relaxed text-white/85">
            {pickLocalized(promo.subtitle, locale)}
          </DialogDescription>
        </div>
        <div className="px-7 pb-7 pt-6">
          <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-3 pl-5">
            <div>
              <p className="font-display text-3xl font-extrabold text-brand-700">{pickLocalized(promo.discountText, locale)}</p>
              <p className="mt-0.5 font-mono text-sm font-bold tracking-[0.2em] text-brand-800">{promo.couponCode}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={copy} className="h-10">
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              {copied ? t('copied') : t('copy')}
            </Button>
          </div>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row-reverse">
            <Button asChild block size="lg" onClick={() => setOpen(false)}>
              <Link href="/membership">{t('view')}</Link>
            </Button>
            <Button variant="ghost" size="lg" block onClick={() => setOpen(false)}>
              {t('dismiss')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
