import { useTranslations } from 'next-intl';
import { CreditCard, Code2, Rocket } from 'lucide-react';
import { SearchBox } from './search-box';

export function HeroSwooshes({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 560" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-40 420C260 220 520 120 820 170s520 230 680 120" stroke="url(#swoosh-a)" strokeWidth="1.6" />
      <path d="M-60 500C300 300 600 230 900 300s420 160 600 40" stroke="url(#swoosh-b)" strokeWidth="1.2" />
      <path d="M1500 60C1180 40 980 220 760 380S300 600 -40 520" stroke="url(#swoosh-c)" strokeWidth="1.4" />
      <defs>
        <linearGradient id="swoosh-a" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4b5fd" stopOpacity="0" />
          <stop offset="0.5" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#e879f9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="swoosh-b" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ddd6fe" stopOpacity="0" />
          <stop offset="0.6" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#ddd6fe" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="swoosh-c" x1="1440" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0abfc" stopOpacity="0" />
          <stop offset="0.45" stopColor="#d8b4fe" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Hero({ query }: { query?: string }) {
  const t = useTranslations('hero');
  const trust = [
    { icon: Code2, label: t('trust.source') },
    { icon: CreditCard, label: t('trust.payments') },
    { icon: Rocket, label: t('trust.support') },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-lavender">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(700px_320px_at_20%_10%,rgb(189_158_226/0.45),transparent),radial-gradient(600px_300px_at_85%_30%,rgb(217_199_239/0.35),transparent)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(85_28_150/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(85_28_150/0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <HeroSwooshes className="absolute inset-0 -z-10 h-full w-full" />

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-12 text-center sm:pb-24 sm:pt-20">
        <h1 className="animate-fade-up">
          <span className="relative z-10 block -rotate-3 font-script text-[64px] leading-none text-brand-700 sm:text-[104px]">{t('script')}</span>
          <span className="-mt-3 block font-display text-[46px] font-extrabold leading-[1.05] tracking-tight text-ink sm:-mt-6 sm:text-[84px]">
            {t('title')}
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft animate-fade-up [animation-delay:80ms] sm:text-lg">
          {t('subtitle')}
        </p>
        <div className="mt-8 animate-fade-up [animation-delay:160ms]">
          <SearchBox initialQuery={query} />
        </div>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 animate-fade-up [animation-delay:240ms]">
          {trust.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
              <span className="grid size-7 place-items-center rounded-lg bg-white text-brand-600 shadow-sm ring-1 ring-brand-100">
                <Icon className="size-4" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
