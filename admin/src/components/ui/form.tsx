import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-lg border border-line bg-surface px-3 text-[13.5px] text-ink shadow-[0_1px_1px_rgb(0_0_0/0.02)] transition placeholder:text-muted/70 hover:border-brand-300/70 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-400';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(base, 'h-10', className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, 'min-h-24 py-2.5 leading-relaxed', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn(base, 'h-10 cursor-pointer appearance-none pr-9', className)} {...props}>
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
  </div>
));
Select.displayName = 'Select';

interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  id?: string;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, label, description, id, disabled }: SwitchProps) {
  const control = (
    <SwitchPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition data-[state=checked]:bg-brand-600 disabled:opacity-50 dark:bg-slate-700"
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
    </SwitchPrimitive.Root>
  );
  if (!label) return control;
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-line bg-surface-2 px-4 py-3">
      <span>
        <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[12px] text-muted">{description}</span>}
      </span>
      {control}
    </label>
  );
}
