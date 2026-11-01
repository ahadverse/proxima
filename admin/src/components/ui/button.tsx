import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';
import { Spinner } from './misc';

export const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand-700 text-white shadow-[0_8px_20px_-10px_rgb(85_28_150/0.8)] hover:brightness-110 active:scale-[0.98]',
        secondary: 'border border-line bg-surface text-ink-soft shadow-sm hover:bg-hover hover:text-ink',
        ghost: 'text-ink-soft hover:bg-hover hover:text-ink',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        'danger-ghost': 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700',
      },
      size: {
        sm: 'h-8 px-3 text-[13px]',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-sm',
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, ...props }, ref) => {
    const Component = asChild ? Slot.Root : 'button';
    return (
      <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={asChild ? undefined : disabled || loading} {...props}>
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Spinner />}
            {children}
          </>
        )}
      </Component>
    );
  },
);
Button.displayName = 'Button';
