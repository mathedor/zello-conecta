import { redirect } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import { QuickActionsCell } from '@/components/admin/quick-actions';
import { SortableTh } from '@/components/admin/sortable-th';
import { COMPLETED_BOOKING_STATUS, parseDateRange } from '@/lib/report-utils';
import { formatBRL } from '@/lib/pricing';

export const metadata = { title: 'Ranking de usuários' };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function RelatorioUsuariosPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');
  const sp = await searchParams;
  const range = parseDateRange(sp);
  const sort = sp.sort ?? 'value';
  const dir: 'asc' | 'desc' = sp.dir === 'asc' ? 'asc' : 'desc';

  const grouped = await prisma.booking.groupBy({
    by: ['clientId'],
    where: {
      createdAt: { gte: range.from, lte: range.to },
      status: { in: COMPLETED_BOOKING_STATUS },
    },
    _count: { id: true },
    _sum: { totalAmount: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
    take: 200,
  });

  const userIds = grouped.map((g) => g.clientId);
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          phone: true,
          address: { select: { city: true, state: true } },
        },
      })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const rows = grouped.map((g) => {
    const u = userMap.get(g.clientId);
    return {
      clientId: g.clientId,
      name: u?.name ?? '—',
      phone: u?.phone ?? null,
      city: u?.address?.city ?? null,
      state: u?.address?.state ?? null,
      qty: g._count.id,
      value: Number(g._sum.totalAmount ?? 0),
    };
  });

  rows.sort((a, b) => {
    const mul = dir === 'asc' ? 1 : -1;
    if (sort === 'name') return a.name.localeCompare(b.name) * mul;
    if (sort === 'qty') return (a.qty - b.qty) * mul;
    if (sort === 'city') return (a.city ?? '').localeCompare(b.city ?? '') * mul;
    return (a.value - b.value) * mul;
  });

  const totals = {
    qty: rows.reduce((s, r) => s + r.qty, 0),
    value: rows.reduce((s, r) => s + r.value, 0),
  };

  const basePath = '/admin/relatorios/usuarios';

  return (
    <DashboardShell
      title="Ranking de usuários"
      description={`${rows.length} cliente(s) compraram entre ${range.fromIso} e ${range.toIso}.`}
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
              <p className="text-sm text-muted-foreground">Sem compras no período.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40">
                  <tr>
                    <SortableTh field="name" label="Nome" basePath={basePath} />
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cidade
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      UF
                    </th>
                    <SortableTh field="qty" label="Qtd" basePath={basePath} />
                    <SortableTh field="value" label="Valor total" basePath={basePath} />
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r, i) => (
                    <tr key={r.clientId} className="hover:bg-secondary/30">
                      <td className="px-3 py-3">
                        <span className="text-xs text-muted-foreground">#{i + 1} </span>
                        <span className="font-medium">{r.name}</span>
                      </td>
                      <td className="px-3 py-3 text-xs">{r.city ?? '—'}</td>
                      <td className="px-3 py-3 text-xs">{r.state ?? '—'}</td>
                      <td className="px-3 py-3 text-xs font-semibold">{r.qty}</td>
                      <td className="px-3 py-3 text-xs font-semibold text-zello-600">
                        {formatBRL(r.value)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <QuickActionsCell
                          view360Href={`/admin/usuarios/${r.clientId}`}
                          phone={r.phone}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-border bg-secondary/40 font-semibold">
                  <tr>
                    <td className="px-3 py-3 text-xs uppercase">Totais</td>
                    <td colSpan={2} />
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
