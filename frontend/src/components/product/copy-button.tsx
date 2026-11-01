'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CopyButton({ value, className, label }: { value: string; className?: string; label?: string }) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard unavailable */
        }
      }}
      aria-label={label ?? t('copy')}
      title={copied ? t('copied') : (label ?? t('copy'))}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-muted transition hover:border-brand-200 hover:text-brand-700',
        copied && 'border-emerald-200 text-emerald-600',
        className,
      )}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}
