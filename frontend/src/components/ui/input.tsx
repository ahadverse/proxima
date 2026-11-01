import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition placeholder:text-slate-400 hover:border-brand-200 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-100';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, 'h-12', className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, 'min-h-28 py-3 leading-relaxed', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-sm font-semibold text-ink-soft', className)} {...props} />;
}

interface FieldProps {
  label: ReactNode;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, className, action, children }: FieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-[13px] font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
