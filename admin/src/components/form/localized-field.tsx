import { useState, type ReactNode } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { Localized } from '@/shared';
import { fieldMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Input, Textarea } from '@/components/ui/form';
import { RichTextEditor } from './rich-text-editor';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
] as const;

interface LocalizedFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: ReactNode;
  kind?: 'input' | 'textarea' | 'rich';
  required?: boolean;
  hint?: ReactNode;
  placeholder?: string;
  className?: string;
}

/** One bilingual value edited through English / বাংলা tabs. */
export function LocalizedField<T extends FieldValues>({ control, name, label, kind = 'input', required, hint, placeholder, className }: LocalizedFieldProps<T>) {
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = (field.value ?? { en: '', bn: '' }) as Localized;
        const error = (fieldState.error as unknown as { en?: { message?: string }; message?: string } | undefined);
        const message = fieldMessage(error?.en?.message ?? error?.message);
        const set = (text: string) => field.onChange({ ...value, [lang]: text });

        return (
          <div className={className}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[12.5px] font-semibold text-ink-soft">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
              </span>
              <div className="flex rounded-md border border-line bg-surface-2 p-0.5">
                {LANGS.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLang(item.code)}
                    className={cn(
                      'flex items-center gap-1.5 rounded px-2 py-0.5 text-[11.5px] font-semibold transition',
                      lang === item.code ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', value[item.code]?.trim() ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600')} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {kind === 'rich' ? (
              <RichTextEditor key={lang} value={value[lang] ?? ''} onChange={set} placeholder={placeholder} />
            ) : kind === 'textarea' ? (
              <Textarea value={value[lang] ?? ''} onChange={(e) => set(e.target.value)} onBlur={field.onBlur} placeholder={placeholder} lang={lang} aria-invalid={Boolean(message)} />
            ) : (
              <Input value={value[lang] ?? ''} onChange={(e) => set(e.target.value)} onBlur={field.onBlur} placeholder={placeholder} lang={lang} aria-invalid={Boolean(message)} />
            )}
            {message ? <p className="mt-1 text-[12px] font-medium text-red-600">{message}</p> : hint ? <p className="mt-1 text-[12px] text-muted">{hint}</p> : null}
          </div>
        );
      }}
    />
  );
}
