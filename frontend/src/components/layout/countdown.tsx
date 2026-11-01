'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { OfferMode } from '@/shared';
import { cn, formatNumber } from '@/lib/utils';

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function computeTarget(mode: OfferMode, endsAt: string | null, now: number): number | null {
  if (mode === 'fixed') return endsAt ? new Date(endsAt).getTime() : null;
  const dhakaNow = now + DHAKA_OFFSET_MS;
  return Math.floor(dhakaNow / DAY_MS) * DAY_MS + DAY_MS - DHAKA_OFFSET_MS;
}

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

interface CountdownProps {
  mode: OfferMode;
  endsAt: string | null;
  variant?: 'bar' | 'boxes';
  className?: string;
  onExpire?: () => void;
}

export function useCountdown(mode: OfferMode, endsAt: string | null) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return { ready: false, expired: false, parts: null };
  const target = computeTarget(mode, endsAt, now);
  if (target === null) return { ready: true, expired: true, parts: null };
  const remaining = target - now;
  return { ready: true, expired: remaining <= 0, parts: split(remaining) };
}

export function Countdown({ mode, endsAt, variant = 'bar', className }: CountdownProps) {
  const t = useTranslations('offer');
  const locale = useLocale();
  const { parts } = useCountdown(mode, endsAt);

  const units = [
    { key: 'days', label: t('days'), value: parts?.days },
    { key: 'hours', label: t('hours'), value: parts?.hours },
    { key: 'minutes', label: t('minutes'), value: parts?.minutes },
    { key: 'seconds', label: t('seconds'), value: parts?.seconds },
  ];

  const pad = (value: number | undefined) => (value === undefined ? '--' : formatNumber(value, locale).padStart(2, locale === 'bn' ? '০' : '0'));

  if (variant === 'boxes') {
    return (
      <div className={cn('grid grid-cols-4 gap-2.5', className)} role="timer" aria-live="off">
        {units.map((unit) => (
          <div key={unit.key} className="rounded-2xl border border-brand-100 bg-white py-3 text-center shadow-sm">
            <div className="font-display text-[26px] font-extrabold tabular-nums text-brand-700">{pad(unit.value)}</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">{unit.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)} role="timer" aria-live="off">
      {units.map((unit) => (
        <div key={unit.key} className="min-w-[38px] rounded-lg bg-white/10 px-1.5 py-1 text-center ring-1 ring-white/15 backdrop-blur">
          <div className="text-[15px] font-bold leading-none tabular-nums text-white">{pad(unit.value)}</div>
          <div className="mt-0.5 text-[8.5px] font-medium uppercase leading-none tracking-wide text-white/65">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
