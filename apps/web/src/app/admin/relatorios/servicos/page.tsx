import { redirect } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import { SortableTh } from '@/components/admin/sortable-th';
import { COMPLETED_BOOKING_STATUS, parseDateRange } from '@/lib/report-utils';
import { formatBRL } from '@/lib/pricing';
import { ServiceBookingsButton } from '@/components/admin/service-bookings-sheet';

export const metadata = { title: 'Ranking de serviços' };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string; sort?: string; dir?: string }>;
}

export default async function RelatorioServicosPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');
  const sp = await searchParams;
  const range = parseDateRange(sp);
  const sort = sp.sort ?? 'value';
  const dir: 'asc' | 'desc' = sp.dir === 'asc' ? 'asc' : 'desc';

  const grouped = await prisma.booking.groupBy({
    by: ['serviceId'],
    where: {
      createdAt: { gte: range.from, lte: range.to },
      status: { in: COMPLETED_BOOKING_STATUS },
    },
    _count: { id: true },
    _sum: { totalAmount: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
    take: 200,
  });

  const ids = grouped.map((g) => g.serviceId);
  const services = ids.length
    ? await prisma.service.findMany({
        where: { id: { in: ids } },
        include: {
          category: { select: { name: true } },
          professional: {
            select: {
              city: true,
              state: true,
              user: { select: { id: true, name: true } },
            },
          },
        },
      })
    : [];
  const svcMap = new Map(services.map((s) => [s.id, s]));

  const rows = grouped.map((g) => {
    const s = svcMap.get(g.serviceId);
    return {
      serviceId: g.serviceId,
      title: s?.title ?? '—',
      slug: s?.slug ?? '',
      proName: s?.professional.user.name ?? '—',
      proUserId: s?.professional.user.id ?? '',
      city: s?.professional.city ?? null,
      state: s?.professional.state ?? null,
      category: s?.category?.name ?? null,
      qty: g._count.id,
      value: Number(g._sum.totalAmount ?? 0),
    };
  });

  rows.sort((a, b) => {
    const mul = dir === 'asc' ? 1 : -1;
    if (sort === 'title') return a.title.localeCompare(b.title) * mul;
    if (sort === 'pro') return a.proName.localeCompare(b.proName) * mul;
    if (sort === 'qty') return (a.qty - b.qty) * mul;
    return (a.value - b.value) * mul;
  });

  const totals = {
    qty: rows.reduce((s, r) => s + r.qty, 0),
    value: rows.reduce((s, r) => s + r.value, 0),
  };

  const basePath = '/admin/relatorios/servicos';

  return (
    <DashboardShell
      title="Ranking de serviços"
      description={`${rows.length} serviço(s) vendido(s) entre ${range.fromIso} e ${range.toIso}.`}
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
              <table className="w-full text-sm table-cards">
                <thead className="border-b border-border bg-secondary/40">
                  <tr>
                    <SortableTh field="title" label="Serviço" basePath={basePath} />
                    <SortableTh field="pro" label="Profissional" basePath={basePath} />
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cidade
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Categoria
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
                    <tr key={r.serviceId} className="hover:bg-secondary/30">
                      <td className="px-3 py-3">
                        <span className="text-xs text-muted-foreground">#{i + 1} </span>
                        <span className="font-medium">{r.title}</span>
                      </td>
                      <td className="px-3 py-3 text-xs">{r.proName}</td>
                      <td className="px-3 py-3 text-xs">
                        {r.city ? `${r.city}/${r.state ?? ''}` : '—'}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {r.category ? (
                          <Badge variant="soft" className="text-[10px]">
                            {r.category}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold">{r.qty}</td>
                      <td className="px-3 py-3 text-xs font-semibold text-zello-600">
                        {formatBRL(r.value)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <ServiceBookingsButton
                          serviceId={r.serviceId}
                          serviceTitle={r.title}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-border bg-secondary/40 font-semibold">
                  <tr>
                    <td className="px-3 py-3 text-xs uppercase">Totais</td>
                    <td colSpan={3} />
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
