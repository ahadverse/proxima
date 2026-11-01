'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DropdownMenu } from 'radix-ui';
import { ArrowDownUp, Check, ChevronDown } from 'lucide-react';
import { SORT_OPTIONS, type SortOption } from '@/shared/constants';
import { Spinner } from '@/components/ui/spinner';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function SortMenu({ value }: { value: SortOption }) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const select = (next: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'default') params.delete('sort');
    else params.set('sort', next);
    params.delete('page');
    const query = params.toString();
    startTransition(() => router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false }));
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-[13px] font-semibold text-ink-soft shadow-sm transition hover:border-brand-200 hover:text-brand-700"
        >
          {pending ? <Spinner className="size-4 text-brand-600" /> : <ArrowDownUp className="size-4 text-brand-500" />}
          <span className="hidden text-muted sm:inline">{t('sortBy')}:</span>
          {t(`sort.${value}`)}
          <ChevronDown className="size-4 opacity-60" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-40 min-w-56 rounded-2xl border border-line bg-white p-1.5 shadow-[0_24px_60px_-20px_rgb(34_10_61/0.35)] data-[state=open]:animate-[fade-up_0.18s_ease-out]"
        >
          <DropdownMenu.RadioGroup value={value} onValueChange={(next) => select(next as SortOption)}>
            {SORT_OPTIONS.map((option) => (
              <DropdownMenu.RadioItem
                key={option}
                value={option}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition data-[highlighted]:bg-brand-50',
                  option === value ? 'text-brand-700' : 'text-ink-soft',
                )}
              >
                {t(`sort.${option}`)}
                <DropdownMenu.ItemIndicator>
                  <Check className="size-4" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
