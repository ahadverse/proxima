import type { ReactNode } from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export function TabsList({ items, className }: { items: { value: string; label: ReactNode }[]; className?: string }) {
  return (
    <TabsPrimitive.List className={cn('inline-flex rounded-lg border border-line bg-surface-2 p-0.5', className)}>
      {items.map((item) => (
        <TabsPrimitive.Trigger
          key={item.value}
          value={item.value}
          className="rounded-md px-3 py-1.5 text-[12.5px] font-semibold text-muted transition data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-sm"
        >
          {item.label}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  );
}
