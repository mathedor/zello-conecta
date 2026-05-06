import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Inbox, MapPin } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import { SortableTh } from '@/components/admin/sortable-th';
import { COMPLETED_BOOKING_STATUS, parseDateRange } from '@/lib/report-utils';
import { formatBRL } from '@/lib/pricing';

export const metadata = { title: 'Ranking de cidades' };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string; sort?: string; dir?: string }>;
}

export default async function RelatorioCidadesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');
  const sp = await searchParams;
  const range = parseDateRange(sp);
  const sort = sp.sort ?? 'value';
  const dir: 'asc' | 'desc' = sp.dir === 'asc' ? 'asc' : 'desc';

  const grouped = await prisma.booking.groupBy({
    by: ['professionalId'],
    where: {
      createdAt: { gte: range.from, lte: range.to },
      status: { in: COMPLETED_BOOKING_STATUS },
    },
    _count: { id: true },
    _sum: { totalAmount: true },
  });

  const ids = grouped.map((g) => g.professionalId);
  const pros = ids.length
    ? await prisma.professional.findMany({
        where: { id: { in: ids } },
        select: { id: true, city: true, state: true },
      })
    : [];
  const proMap = new Map(pros.map((p) => [p.id, p]));

  const cityAgg = new Map<string, { city: string; state: string; qty: number; value: number }>();
  for (const g of grouped) {
    const p = proMap.get(g.professionalId);
    const city = p?.city ?? 'Sem cidade';
    const state = p?.state ?? '';
    const key = `${city}|${state}`;
    const cur = cityAgg.get(key) ?? { city, state, qty: 0, value: 0 };
    cur.qty += g._count.id;
    cur.value += Number(g._sum.totalAmount ?? 0);
    cityAgg.set(key, cur);
  }
  const rows = Array.from(cityAgg.values());
  rows.sort((a, b) => {
    const mul = dir === 'asc' ? 1 : -1;
    if (sort === 'city') return a.city.localeCompare(b.city) * mul;
    if (sort === 'state') return a.state.localeCompare(b.state) * mul;
    if (sort === 'qty') return (a.qty - b.qty) * mul;
    return (a.value - b.value) * mul;
  });

  const totals = {
    qty: rows.reduce((s, r) => s + r.qty, 0),
    value: rows.reduce((s, r) => s + r.value, 0),
  };

  const basePath = '/admin/relatorios/cidades';

  return (
    <DashboardShell
      title="Ranking de cidades"
      description={`${rows.length} cidade(s) com vendas entre ${range.fromIso} e ${range.toIso}.`}
    >
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <DateRangeFilter />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Sem vendas no período.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40">
                  <tr>
                    <SortableTh field="city" label="Cidade" basePath={basePath} />
                    <SortableTh field="state" label="UF" basePath={basePath} />
                    <SortableTh field="qty" label="Qtd vendas" basePath={basePath} />
                    <SortableTh field="value" label="Valor total" basePath={basePath} />
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r, i) => (
                    <tr key={`${r.city}-${r.state}-${i}`} className="hover:bg-secondary/30">
                      <td className="px-3 py-3">
                        <span className="text-xs text-muted-foreground">#{i + 1} </span>
                        <span className="font-medium">{r.city}</span>
                      </td>
                      <td className="px-3 py-3 text-xs">{r.state || '—'}</td>
                      <td className="px-3 py-3 text-xs font-semibold">{r.qty}</td>
                      <td className="px-3 py-3 text-xs font-semibold text-zello-600">
                        {formatBRL(r.value)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/buscar?city=${encodeURIComponent(r.city)}${r.state ? `&state=${r.state}` : ''}`}
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            Ver
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-border bg-secondary/40 font-semibold">
                  <tr>
                    <td className="px-3 py-3 text-xs uppercase">Totais</td>
                    <td />
                    <td className="px-3 py-3 text-sm">{totals.qty}</td>
                    <td className="px-3 py-3 text-sm text-zello-600">{formatBRL(totals.value)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
