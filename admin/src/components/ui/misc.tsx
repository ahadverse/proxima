import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('size-4 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('skeleton rounded-md', className)} {...props} />;
}

const badgeVariants = cva('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold', {
  variants: {
    tone: {
      brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
      success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      info: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export function Badge({ className, tone, dot, children, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
        {description && <p className="mt-1 text-[13.5px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, actions, children, className, bodyClassName }: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('panel', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-[15px] font-bold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 [&_svg]:size-6">{icon}</div>
      <p className="font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-[13px] text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
