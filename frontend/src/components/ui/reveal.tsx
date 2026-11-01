import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Fades content up as it scrolls into view. Pure CSS (see `.reveal`), so the
 * server-rendered markup is visible before any JavaScript runs.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('reveal', className)}>{children}</div>;
}
