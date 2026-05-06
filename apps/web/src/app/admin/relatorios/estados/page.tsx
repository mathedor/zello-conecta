import { redirect } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import { SortableTh } from '@/components/admin/sortable-th';
import { COMPLETED_BOOKING_STATUS, parseDateRange } from '@/lib/report-utils';
import { formatBRL } from '@/lib/pricing';

export const metadata = { title: 'Ranking de estados' };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string; sort?: string; dir?: string }>;
}

export default async function RelatorioEstadosPage({ searchParams }: PageProps) {
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
        select: { id: true, state: true },
      })
    : [];
  const proMap = new Map(pros.map((p) => [p.id, p]));

  const stateAgg = new Map<string, { state: string; qty: number; value: number }>();
  for (const g of grouped) {
    const p = proMap.get(g.professionalId);
    const state = p?.state ?? 'Sem UF';
    const cur = stateAgg.get(state) ?? { state, qty: 0, value: 0 };
    cur.qty += g._count.id;
    cur.value += Number(g._sum.totalAmount ?? 0);
    stateAgg.set(state, cur);
  }
  const rows = Array.from(stateAgg.values());
  rows.sort((a, b) => {
    const mul = dir === 'asc' ? 1 : -1;
    if (sort === 'state') return a.state.localeCompare(b.state) * mul;
    if (sort === 'qty') return (a.qty - b.qty) * mul;
    return (a.value - b.value) * mul;
  });

  const totals = {
    qty: rows.reduce((s, r) => s + r.qty, 0),
    value: rows.reduce((s, r) => s + r.value, 0),
  };

  const basePath = '/admin/relatorios/estados';

  return (
    <DashboardShell
      title="Ranking de estados"
      description={`${rows.length} UF(s) com vendas entre ${range.fromIso} e ${range.toIso}.`}
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
                    <SortableTh field="state" label="UF" basePath={basePath} />
                    <SortableTh field="qty" label="Qtd vendas" basePath={basePath} />
                    <SortableTh field="value" label="Valor total" basePath={basePath} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r, i) => (
                    <tr key={r.state} className="hover:bg-secondary/30">
                      <td className="px-3 py-3">
                        <span className="text-xs text-muted-foreground">#{i + 1} </span>
                        <span className="font-medium">{r.state}</span>
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold">{r.qty}</td>
                      <td className="px-3 py-3 text-xs font-semibold text-zello-600">
                        {formatBRL(r.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-border bg-secondary/40 font-semibold">
                  <tr>
                    <td className="px-3 py-3 text-xs uppercase">Totais</td>
                    <td className="px-3 py-3 text-sm">{totals.qty}</td>
                    <td className="px-3 py-3 text-sm text-zello-600">{formatBRL(totals.value)}</td>
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
