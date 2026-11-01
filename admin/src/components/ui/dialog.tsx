import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, footer, className }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-line bg-surface shadow-2xl animate-in',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div>
              <DialogPrimitive.Title className="text-base font-bold text-ink">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className={cn('mt-0.5 text-[13px] text-muted', !description && 'sr-only')}>
                {description ?? title}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-hover hover:text-ink" aria-label="Close">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>(undefined);

  const confirm = useCallback<ConfirmFn>((next) => {
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (value: boolean) => {
    resolver.current?.(value);
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <DialogPrimitive.Root open={Boolean(options)} onOpenChange={(open) => !open && close(false)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-[2px]" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in">
            <div className="flex gap-4">
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-full',
                  options?.tone === 'primary' ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-600 dark:bg-red-950/40',
                )}
              >
                <TriangleAlert className="size-5" />
              </span>
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-ink">{options?.title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-[13.5px] leading-relaxed text-muted">{options?.description}</DialogPrimitive.Description>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button variant={options?.tone === 'primary' ? 'primary' : 'danger'} onClick={() => close(true)} autoFocus>
                {options?.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
