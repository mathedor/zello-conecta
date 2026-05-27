'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Filter, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
}

interface SearchFiltersProps {
  categories: CategoryOption[];
}

const ORDER_OPTIONS = [
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'recent', label: 'Mais recentes' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
];

export function SearchFilters({ categories }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const set = (next: Record<string, string | null>) => {
    const url = new URL(pathname, 'https://zello.local');
    params.forEach((v, k) => url.searchParams.set(k, v));
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === '') url.searchParams.delete(k);
      else url.searchParams.set(k, v);
    });
    url.searchParams.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${url.searchParams.toString()}`);
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Record<string, string | null> = {
      q: (fd.get('q') as string) || null,
      city: (fd.get('city') as string) || null,
      state: (fd.get('state') as string)?.toUpperCase() || null,
      priceMin: (fd.get('priceMin') as string) || null,
      priceMax: (fd.get('priceMax') as string) || null,
      minRating: (fd.get('minRating') as string) || null,
    };
    set(next);
  };

  const clearAll = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const activeCount = ['q', 'category', 'city', 'state', 'priceMin', 'priceMax', 'minRating'].filter(
    (k) => params.get(k),
  ).length;

  return (
    <aside aria-label="Filtros" className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zello-600" />
          <h2 className="font-semibold">Filtros</h2>
          {activeCount > 0 ? (
            <span className="rounded-full bg-zello-50 px-2 py-0.5 text-xs font-medium text-zello-700">
              {activeCount}
            </span>
          ) : null}
        </div>
        {activeCount > 0 ? (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            disabled={pending}
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Ordenar por
        </Label>
        <select
          value={params.get('order') ?? 'rating'}
          onChange={(e) => set({ order: e.target.value })}
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Categoria
        </Label>
        <select
          value={params.get('category') ?? ''}
          onChange={(e) => set({ category: e.target.value || null })}
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 border-t border-border pt-5">
        <div className="space-y-2">
          <Label htmlFor="q" className="text-xs uppercase tracking-wider text-muted-foreground">
            Buscar
          </Label>
          <Input
            id="q"
            name="q"
            type="search"
            placeholder="Nome, especialidade..."
            defaultValue={params.get('q') ?? ''}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground">
              Cidade
            </Label>
            <Input id="city" name="city" placeholder="São Paulo" defaultValue={params.get('city') ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-xs uppercase tracking-wider text-muted-foreground">
              UF
            </Label>
            <Input
              id="state"
              name="state"
              placeholder="SP"
              maxLength={2}
              defaultValue={params.get('state') ?? ''}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Faixa de preço
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="priceMin"
              type="number"
              min="0"
              placeholder="Min"
              defaultValue={params.get('priceMin') ?? ''}
            />
            <Input
              name="priceMax"
              type="number"
              min="0"
              placeholder="Máx"
              defaultValue={params.get('priceMax') ?? ''}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minRating" className="text-xs uppercase tracking-wider text-muted-foreground">
            Nota mínima
          </Label>
          <select
            id="minRating"
            name="minRating"
            defaultValue={params.get('minRating') ?? ''}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Qualquer</option>
            <option value="3">3★ ou mais</option>
            <option value="4">4★ ou mais</option>
            <option value="4.5">4.5★ ou mais</option>
          </select>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Aplicando...
            </>
          ) : (
            'Aplicar filtros'
          )}
        </Button>
      </form>
    </aside>
  );
}
