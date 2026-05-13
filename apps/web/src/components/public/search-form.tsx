'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  ChevronDown,
  Clock,
  LayoutGrid,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface CategoryOption {
  id: string;
  slug: string;
  name: string;
}

export interface SearchFormValues {
  q?: string;
  city?: string;
  state?: string;
  category?: string;
  date?: string;
  time?: string;
  priceMin?: string;
  priceMax?: string;
  minRating?: string;
  order?: string;
}

interface SearchFormProps {
  variant?: 'hero' | 'inline';
  defaultValues?: SearchFormValues;
  categories?: CategoryOption[];
  className?: string;
  showAdvancedByDefault?: boolean;
}

const ORDER_OPTIONS = [
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'recent', label: 'Mais recentes' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
];

const TIME_OPTIONS = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 22; h += 1) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    out.push(`${String(h).padStart(2, '0')}:30`);
  }
  return out;
})();

function todayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function SearchForm({
  variant = 'inline',
  defaultValues,
  categories: categoriesProp,
  className,
  showAdvancedByDefault,
}: SearchFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(defaultValues?.q ?? '');
  const [city, setCity] = useState(defaultValues?.city ?? '');
  const [state, setStateValue] = useState(defaultValues?.state ?? '');
  const [category, setCategory] = useState(defaultValues?.category ?? '');
  const [date, setDate] = useState(defaultValues?.date ?? '');
  const [time, setTime] = useState(defaultValues?.time ?? '');
  const [priceMin, setPriceMin] = useState(defaultValues?.priceMin ?? '');
  const [priceMax, setPriceMax] = useState(defaultValues?.priceMax ?? '');
  const [minRating, setMinRating] = useState(defaultValues?.minRating ?? '');
  const [order, setOrder] = useState(defaultValues?.order ?? 'rating');

  const hasAdvancedActive = Boolean(
    defaultValues?.priceMin ||
      defaultValues?.priceMax ||
      defaultValues?.minRating ||
      (defaultValues?.order && defaultValues.order !== 'rating'),
  );
  const [advancedOpen, setAdvancedOpen] = useState(
    showAdvancedByDefault ?? hasAdvancedActive,
  );

  const [categories, setCategories] = useState<CategoryOption[]>(categoriesProp ?? []);

  useEffect(() => {
    if (categoriesProp && categoriesProp.length > 0) return;
    let cancelled = false;
    fetch('/api/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setCategories(d.categories ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [categoriesProp]);

  const today = useMemo(() => todayIso(), []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (city.trim()) params.set('city', city.trim());
    if (state.trim()) params.set('state', state.trim().toUpperCase());
    if (category) params.set('category', category);
    if (date) params.set('date', date);
    if (time) params.set('time', time);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (minRating) params.set('minRating', minRating);
    if (order && order !== 'rating') params.set('order', order);
    startTransition(() => {
      router.push(`/buscar${params.toString() ? `?${params.toString()}` : ''}`);
    });
  };

  const clearAdvanced = () => {
    setPriceMin('');
    setPriceMax('');
    setMinRating('');
    setOrder('rating');
  };

  const isHero = variant === 'hero';

  const wrapperClass = cn(
    'rounded-3xl border shadow-2xl backdrop-blur-md',
    isHero
      ? 'border-white/15 bg-white/95 p-2'
      : 'border-border bg-card p-3 shadow-lg',
    className,
  );

  return (
    <form
      onSubmit={submit}
      aria-label="Busca de profissionais"
      className={cn('w-full', isHero ? 'mx-auto max-w-6xl' : '')}
    >
      <div className={wrapperClass}>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-12 md:items-stretch">
          <FormField
            wide
            cols="md:col-span-2"
            icon={<Search className="h-3.5 w-3.5" />}
            label="O que precisa?"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Diarista, advogado..."
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60 md:text-xs"
            />
          </FormField>

          <FormField
            cols="md:col-span-2"
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Cidade"
          >
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="São Paulo"
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60 md:text-xs"
            />
          </FormField>

          <FormField
            cols="md:col-span-1"
            icon={<span className="text-[9px] font-bold">UF</span>}
            label="UF"
          >
            <input
              type="text"
              value={state}
              onChange={(e) => setStateValue(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
              maxLength={2}
              className="w-full bg-transparent text-sm font-medium uppercase text-foreground outline-none placeholder:text-muted-foreground/60 md:text-xs"
            />
          </FormField>

          <FormField
            cols="md:col-span-2"
            icon={<LayoutGrid className="h-3.5 w-3.5" />}
            label="Categoria"
          >
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none md:text-xs"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            cols="md:col-span-2"
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Data"
          >
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none md:text-xs"
            />
          </FormField>

          <FormField
            cols="md:col-span-1"
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Hora"
          >
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none md:text-xs"
            >
              <option value="">--:--</option>
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>

          <div className="md:col-span-2 md:flex md:items-stretch">
            <Button
              type="submit"
              disabled={pending}
              className="h-full w-full rounded-2xl md:rounded-full"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="md:hidden">Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-center px-1">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
              isHero
                ? 'text-zello-800 hover:bg-zello-50'
                : 'text-foreground hover:bg-muted',
            )}
            aria-expanded={advancedOpen}
          >
            <SlidersHorizontal className="h-3 w-3" />
            {advancedOpen ? 'Menos filtros' : 'Mais filtros'}
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform',
                advancedOpen ? 'rotate-180' : '',
              )}
            />
          </button>
        </div>

        {advancedOpen ? (
          <div className="mt-3 grid gap-4 rounded-2xl border border-border bg-background/60 p-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Faixa de preço (R$)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="Máx"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Nota mínima
              </Label>
              <div className="relative">
                <Star className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zello-600" />
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Qualquer</option>
                  <option value="3">3★ ou mais</option>
                  <option value="4">4★ ou mais</option>
                  <option value="4.5">4.5★ ou mais</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Ordenar por
              </Label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ORDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {(priceMin || priceMax || minRating || (order && order !== 'rating')) ? (
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={clearAdvanced}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  Limpar filtros avançados
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}

function FormField({
  icon,
  label,
  children,
  cols,
  wide,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  cols: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-2xl px-2 py-1.5 transition-colors hover:bg-zello-50/70 md:rounded-full md:px-2.5',
        wide ? 'md:pl-3' : '',
        cols,
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zello-50 text-zello-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {children}
      </div>
    </div>
  );
}
