'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESETS: Array<{ label: string; days: number }> = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '12m', days: 365 },
];

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const defaultFrom = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  })();

  const [from, setFrom] = useState(params.get('from') ?? defaultFrom);
  const [to, setTo] = useState(params.get('to') ?? today);

  const apply = (nextFrom = from, nextTo = to) => {
    const next = new URLSearchParams(params.toString());
    next.set('from', nextFrom);
    next.set('to', nextTo);
    next.delete('page');
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  };

  const setPreset = (days: number) => {
    const f = new Date();
    f.setDate(f.getDate() - days);
    const fStr = f.toISOString().slice(0, 10);
    setFrom(fStr);
    setTo(today);
    apply(fStr, today);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="from" className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
          <Calendar className="h-3 w-3" />
          De
        </Label>
        <Input
          id="from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-[160px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="to" className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Até
        </Label>
        <Input
          id="to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-[160px]"
        />
      </div>
      <Button onClick={() => apply()} size="sm" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Aplicar
      </Button>
      <div className="ml-2 hidden gap-1 sm:flex">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            onClick={() => setPreset(p.days)}
            disabled={pending}
            className="text-xs"
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
