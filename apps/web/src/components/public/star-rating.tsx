import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  total?: number;
  className?: string;
}

const sizeMap = {
  sm: { star: 'h-3.5 w-3.5', text: 'text-xs', gap: 'gap-1' },
  md: { star: 'h-4 w-4', text: 'text-sm', gap: 'gap-1.5' },
  lg: { star: 'h-5 w-5', text: 'text-base', gap: 'gap-2' },
};

export function StarRating({ value, size = 'md', showNumber = true, total, className }: StarRatingProps) {
  const { star, text, gap } = sizeMap[size];
  const safeValue = Math.max(0, Math.min(5, value));
  return (
    <div className={cn('inline-flex items-center', gap, className)}>
      <div className="relative inline-flex">
        <div className="flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(star, 'text-zinc-300')} />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex overflow-hidden"
          style={{ width: `${(safeValue / 5) * 100}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(star, 'fill-amber-400 text-amber-400')} />
          ))}
        </div>
      </div>
      {showNumber ? (
        <span className={cn('font-medium', text)}>
          {safeValue.toFixed(1)}
          {typeof total === 'number' ? (
            <span className="font-normal text-muted-foreground"> ({total})</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
