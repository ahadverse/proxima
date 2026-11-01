import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

export const buttonVariants = cva(
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-700 text-white shadow-glow hover:brightness-110 hover:shadow-[0_14px_34px_-12px_rgb(85_28_150/0.7)] active:scale-[0.98]',
        secondary: 'border border-line bg-white text-ink shadow-sm hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700',
        outline: 'border border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50',
        soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
        dark: 'bg-ink text-white hover:bg-ink-soft',
        ghost: 'text-ink-soft hover:bg-brand-50 hover:text-brand-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        link: 'h-auto px-0 text-brand-700 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3.5 text-[13px]',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-[15px]',
        icon: 'size-10',
        'icon-sm': 'size-9 rounded-lg',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild, loading, disabled, children, ...props }, ref) => {
    const Component = asChild ? Slot.Root : 'button';
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Spinner className="size-4" />}
            {children}
          </>
        )}
      </Component>
    );
  },
);
Button.displayName = 'Button';
