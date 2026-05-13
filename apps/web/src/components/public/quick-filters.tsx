'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function todayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function QuickFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const today = todayIso();
  const dateParam = params.get('date');
  const isTodayActive = dateParam === today;

  const apply = (next: Record<string, string | null>) => {
    const qs = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === '') qs.delete(k);
      else qs.set(k, v);
    });
    qs.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${qs.toString()}`);
    });
  };

  const toggleToday = () => {
    if (isTodayActive) apply({ date: null });
    else apply({ date: today });
  };

  const clearAll = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const activeCount = ['q', 'category', 'city', 'state', 'date', 'time', 'priceMin', 'priceMax', 'minRating', 'order'].filter(
    (k) => {
      const v = params.get(k);
      if (!v) return false;
      if (k === 'order' && v === 'rating') return false;
      return true;
    },
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleToday}
        disabled={pending}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
          isTodayActive
            ? 'border-zello-600 bg-zello-600 text-white hover:bg-zello-700'
            : 'border-border bg-card text-foreground hover:bg-muted',
        )}
        aria-pressed={isTodayActive}
      >
        <CalendarCheck className="h-3.5 w-3.5" />
        Disponíveis hoje
      </button>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={clearAll}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Limpar filtros ({activeCount})
        </button>
      ) : null}
    </div>
  );
}
