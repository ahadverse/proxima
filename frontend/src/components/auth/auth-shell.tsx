import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Code2, Infinity as InfinityIcon, Rocket, Zap } from 'lucide-react';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const t = useTranslations('auth');
  const perks = [
    { icon: Code2, label: t('perks.source') },
    { icon: Zap, label: t('perks.instant') },
    { icon: InfinityIcon, label: t('perks.updates') },
    { icon: Rocket, label: t('perks.support') },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
      <div className="relative hidden overflow-hidden rounded-[28px] bg-brand-700 p-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full text-white/10" viewBox="0 0 400 600" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-20 420C120 320 220 360 300 260S380 80 440 60" stroke="currentColor" strokeWidth="1.5" />
          <path d="M-20 500C140 400 240 440 320 340S400 160 460 140" stroke="currentColor" strokeWidth="1" />
        </svg>
        <h2 className="relative mt-auto font-display text-3xl font-extrabold leading-tight">{t('perksTitle')}</h2>
        <ul className="relative mt-8 space-y-4">
          {perks.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-[15px] font-medium text-white/90">
              <span className="grid size-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <Icon className="size-5" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="card flex flex-col justify-center p-7 sm:p-10">
        <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
