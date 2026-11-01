'use client';

import type { ReactNode } from 'react';
import { Tabs } from 'radix-ui';
import { cn } from '@/lib/utils';

interface TabItem {
  value: string;
  label: string;
  badge?: string;
  content: ReactNode;
  /** Mount only when opened, for panels that fetch their own data. */
  lazy?: boolean;
}

export function ProductTabs({ tabs }: { tabs: TabItem[] }) {
  return (
    <Tabs.Root defaultValue={tabs[0]?.value} className="card overflow-hidden">
      <Tabs.List className="flex gap-1 overflow-x-auto border-b border-line px-3 scrollbar-none sm:px-6">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'relative flex shrink-0 items-center gap-2 px-3 py-4 text-sm font-semibold text-muted outline-none transition hover:text-ink sm:px-4',
              'data-[state=active]:text-brand-700',
              'after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-brand-700 after:opacity-0 after:transition data-[state=active]:after:opacity-100',
            )}
          >
            {tab.label}
            {tab.badge && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] text-brand-700">{tab.badge}</span>}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        // Static panels stay in the server HTML (hidden) so search engines can read them.
        <Tabs.Content
          key={tab.value}
          value={tab.value}
          forceMount={tab.lazy ? undefined : true}
          className="p-5 outline-none data-[state=active]:animate-fade-up data-[state=inactive]:hidden sm:p-8"
        >
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
