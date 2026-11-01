import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import type { Localized } from '@/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';

/** Ordered list of bilingual short texts (highlights, features, help topics). */
export function LocalizedListEditor({ value, onChange, placeholder = 'Item', max = 40 }: {
  value: Localized[];
  onChange: (items: Localized[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const update = (index: number, patch: Partial<Localized>) => onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, delta: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item!);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="hidden grid-cols-[1fr_1fr_auto] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted sm:grid">
          <span>English</span>
          <span>বাংলা</span>
          <span className="w-[104px]" />
        </div>
      )}
      {value.map((item, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input value={item.en} onChange={(e) => update(index, { en: e.target.value })} placeholder={`${placeholder} (English)`} />
          <Input value={item.bn} onChange={(e) => update(index, { bn: e.target.value })} placeholder={`${placeholder} (বাংলা)`} lang="bn" />
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
              <ArrowUp />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={index === value.length - 1} onClick={() => move(index, 1)} aria-label="Move down">
              <ArrowDown />
            </Button>
            <Button type="button" variant="danger-ghost" size="icon" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label="Remove">
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      {value.length < max && (
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...value, { en: '', bn: '' }])}>
          <Plus /> Add {placeholder.toLowerCase()}
        </Button>
      )}
    </div>
  );
}

export function TagInput({ value, onChange, placeholder = 'Type and press Enter', max = 20 }: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const tag = draft.trim();
    if (!tag || value.includes(tag) || value.length >= max) return setDraft('');
    onChange([...value, tag]);
    setDraft('');
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/15">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-[12px] font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`} className="opacity-60 hover:opacity-100">
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={value.length ? '' : placeholder}
        className="min-w-[140px] flex-1 bg-transparent px-1 text-[13.5px] text-ink outline-none placeholder:text-muted/70"
      />
    </div>
  );
}
