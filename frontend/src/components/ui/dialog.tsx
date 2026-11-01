'use client';

import type { ReactNode } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

interface DialogContentProps {
  children: ReactNode;
  className?: string;
  closeLabel: string;
  hideClose?: boolean;
}

export function DialogContent({ children, className, closeLabel, hideClose }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-slate-950/55 backdrop-blur-sm data-[state=open]:animate-[fade-up_0.2s_ease-out]" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-[81] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl outline-none data-[state=open]:animate-[fade-up_0.3s_cubic-bezier(0.22,1,0.36,1)]',
          className,
        )}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            aria-label={closeLabel}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-black/5 transition hover:bg-white hover:text-ink"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

interface SheetContentProps {
  children: ReactNode;
  className?: string;
  side?: 'left' | 'right';
  title: string;
  closeLabel: string;
}

export function SheetContent({ children, className, side = 'right', title, closeLabel }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-[81] flex w-[86%] max-w-sm flex-col bg-white shadow-2xl outline-none transition-transform duration-300',
          side === 'right'
            ? 'right-0 data-[state=open]:animate-[slide-in-right_0.3s_cubic-bezier(0.22,1,0.36,1)]'
            : 'left-0 data-[state=open]:animate-[slide-in-left_0.3s_cubic-bezier(0.22,1,0.36,1)]',
          className,
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <DialogPrimitive.Title className="text-base font-bold text-ink">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label={closeLabel}
            className="grid size-9 place-items-center rounded-full text-slate-500 transition hover:bg-brand-50 hover:text-ink"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
