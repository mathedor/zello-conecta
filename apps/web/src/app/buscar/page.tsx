import type { Metadata } from 'next';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter, SearchX } from 'lucide-react';
import { prisma } from '@zello/db';
import { searchProfessionals } from '@/lib/search';
import { ProfessionalCard } from '@/components/public/professional-card';
import { SearchFilters } from '@/components/public/search-filters';

export const metadata: Metadata = {
  title: 'Buscar profissionais',
  description: 'Encontre profissionais verificados por categoria, cidade, faixa de preço e avaliação.',
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
    <main className="container py-8 md:py-12">
      <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Buscar profissionais</h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            {total === 0
              ? 'Nenhum profissional encontrado com esses filtros.'
              : `${total} profissional${total === 1 ? '' : 'is'} disponível${total === 1 ? '' : 'eis'}.`}
          </p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm overflow-y-auto pt-12">
            <SearchFilters categories={categories} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
            <SearchFilters categories={categories} />
          </div>
        </aside>

        <section>
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center md:p-16">
              <SearchX className="h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Nada por aqui ainda</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Tente outra categoria, ampliar o raio de busca ou remover filtros. A plataforma está
                crescendo e novos profissionais entram a cada semana.
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

          {totalPages > 1 ? (
            <Pagination current={page} total={totalPages} sp={sp} />
          ) : null}
        </section>
      </div>
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
    <nav
      aria-label="Paginação"
      className="mt-8 flex items-center justify-center gap-2"
    >
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
