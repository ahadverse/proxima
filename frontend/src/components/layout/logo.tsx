import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  name: string;
  tagline: string;
  logoUrl?: string;
  className?: string;
  inverted?: boolean;
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('relative grid size-10 place-items-center overflow-hidden rounded-xl bg-brand-700 shadow-glow', className)}>
      <svg viewBox="0 0 32 32" className="size-[58%]" aria-hidden="true">
        <path
          d="M9 25V7h8.2c4.1 0 6.8 2.4 6.8 6.1s-2.7 6.1-6.8 6.1H13.4V25H9Zm4.4-9.6h3.5c1.7 0 2.7-.9 2.7-2.3 0-1.5-1-2.3-2.7-2.3h-3.5v4.6Z"
          fill="#fff"
        />
        <circle cx="24.5" cy="24.5" r="2.5" fill="#f5d0fe" />
      </svg>
      <span className="pointer-events-none absolute -right-3 -top-3 size-7 rounded-full bg-white/20 blur-[2px]" />
    </span>
  );
}

export function Logo({ name, tagline, logoUrl, className, inverted }: LogoProps) {
  if (logoUrl) {
    return (
      <span className={cn('flex items-center', className)}>
        <Image src={logoUrl} alt={name} width={160} height={40} className="h-10 w-auto object-contain" loading="eager" unoptimized />
      </span>
    );
  }
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-[19px] font-extrabold tracking-tight', inverted ? 'text-white' : 'text-ink')}>{name}</span>
        <span className={cn('mt-1 text-[11px] font-medium', inverted ? 'text-white/70' : 'text-muted')}>{tagline}</span>
      </span>
    </span>
  );
}
