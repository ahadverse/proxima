import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({ value, className, size = 'sm' }: { value: number; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'lg' ? 'size-5' : size === 'md' ? 'size-4' : 'size-3.5';
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} / 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <span key={index} className={cn('relative', iconSize)}>
            <Star className={cn('absolute inset-0 text-slate-200', iconSize)} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn('text-amber-400', iconSize)} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
