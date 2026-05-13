import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import { prisma } from '@zello/db';
import { searchProfessionals } from '@/lib/search';
import { ProfessionalCard } from '@/components/public/professional-card';
import { SearchForm } from '@/components/public/search-form';
import { QuickFilters } from '@/components/public/quick-filters';

export const metadata: Metadata = {
  title: 'Buscar profissionais',
  description: 'Encontre profissionais verificados por categoria, cidade, data, faixa de preço e avaliação.',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}
function pickNumber(v: string | string[] | undefined): number | undefined {
  const s = pickString(v);
  if (s == null) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const order = pickString(sp.order) as 'rating' | 'recent' | 'price-asc' | 'price-desc' | undefined;

  const params = {
    q: pickString(sp.q),
    category: pickString(sp.category),
    city: pickString(sp.city),
    state: pickString(sp.state),
    date: pickString(sp.date),
    time: pickString(sp.time),
    priceMin: pickNumber(sp.priceMin),
    priceMax: pickNumber(sp.priceMax),
    minRating: pickNumber(sp.minRating),
    order: order ?? 'rating',
    page: pickNumber(sp.page) ?? 1,
  };

  const [{ items, total, page, perPage }, categories] = await Promise.all([
    searchProfessionals(params),
    prisma.category.findMany({
      where: { approved: true },
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <main className="container py-6 md:py-8">
      <div className="mb-5">
        <SearchForm
          variant="inline"
          categories={categories}
          defaultValues={{
            q: params.q,
            city: params.city,
            state: params.state,
            category: params.category,
            date: params.date,
            time: params.time,
            priceMin: params.priceMin ? String(params.priceMin) : undefined,
            priceMax: params.priceMax ? String(params.priceMax) : undefined,
            minRating: params.minRating ? String(params.minRating) : undefined,
            order: params.order,
          }}
        />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <QuickFilters />
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? 'Nenhum profissional encontrado.'
            : `${total} profissional${total === 1 ? '' : 'is'} disponível${total === 1 ? '' : 'eis'}.`}
        </p>
      </div>

      <section>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center md:p-16">
            <SearchX className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Nada por aqui ainda</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Tente outra categoria, ajustar a data ou ampliar a busca. A plataforma está crescendo
              e novos profissionais entram a cada semana.
            </p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/buscar">Limpar filtros</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => (
              <ProfessionalCard key={p.slug} data={p} />
            ))}
          </div>
        )}

        {totalPages > 1 ? <Pagination current={page} total={totalPages} sp={sp} /> : null}
      </section>
    </main>
  );
}

function Pagination({
  current,
  total,
  sp,
}: {
  current: number;
  total: number;
  sp: Record<string, string | string[] | undefined>;
}) {
  const buildQs = (page: number) => {
    const qs = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (typeof v === 'string') qs.set(k, v);
      else if (Array.isArray(v) && v[0]) qs.set(k, v[0]);
    });
    qs.set('page', String(page));
    return qs.toString();
  };

  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-2">
      {current > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/buscar?${buildQs(current - 1)}`}>Anterior</Link>
        </Button>
      ) : null}
      <span className="px-3 text-sm text-muted-foreground">
        Página {current} de {total}
      </span>
      {current < total ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/buscar?${buildQs(current + 1)}`}>Próxima</Link>
        </Button>
      ) : null}
    </nav>
  );
}
