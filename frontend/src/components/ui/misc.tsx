import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('skeleton rounded-lg', className)} {...props} />;
}

const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-full font-semibold', {
  variants: {
    tone: {
      brand: 'bg-brand-50 text-brand-700 ring-1 ring-brand-100',
      success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
      warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
      danger: 'bg-red-50 text-red-700 ring-1 ring-red-100',
      neutral: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
      dark: 'bg-ink text-white',
    },
    size: {
      sm: 'px-2 py-0.5 text-[11px]',
      md: 'px-2.5 py-1 text-xs',
    },
  },
  defaultVariants: { tone: 'brand', size: 'md' },
});

export function Badge({
  className,
  tone,
  size,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, text, action, className }: EmptyStateProps) {
  return (
    <div className={cn('card flex flex-col items-center px-6 py-14 text-center', className)}>
      <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-8 ring-brand-50/50 [&_svg]:size-7">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {text && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionHeading({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <h2 className="text-2xl font-extrabold text-ink sm:text-[28px]">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-muted sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
