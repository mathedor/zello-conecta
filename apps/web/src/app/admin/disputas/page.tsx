import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { prisma, type Prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SortableTh } from '@/components/admin/sortable-th';
import { formatBRL } from '@/lib/pricing';
import { DisputeActions } from './dispute-actions';

export const metadata = { title: 'Disputas' };

interface PageProps {
  searchParams: Promise<{ status?: string; sort?: string; dir?: string }>;
}

export default async function AdminDisputasPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');
  const sp = await searchParams;

  const where: Prisma.DisputeWhereInput = {};
  if (sp.status && ['OPEN', 'UNDER_REVIEW', 'RESOLVED_REFUNDED', 'RESOLVED_RELEASED', 'CLOSED'].includes(sp.status)) {
    where.status = sp.status as 'OPEN';
  }

  const sortField = sp.sort ?? 'createdAt';
  const sortDir = sp.dir === 'asc' ? 'asc' : 'desc';
  const orderBy = { [sortField]: sortDir } as Prisma.DisputeOrderByWithRelationInput;

  const disputes = await prisma.dispute.findMany({
    where,
    orderBy,
    include: {
      booking: {
        include: {
          client: { select: { id: true, name: true, phone: true } },
          professional: {
            select: {
              id: true,
              city: true,
              state: true,
              user: { select: { id: true, name: true } },
            },
          },
          service: { select: { title: true, category: { select: { name: true } } } },
        },
      },
    },
    take: 100,
  });

  const open = disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
  const resolved = disputes.filter((d) => d.status !== 'OPEN' && d.status !== 'UNDER_REVIEW');
  const basePath = '/admin/disputas';

  return (
    <DashboardShell
      title="Disputas"
      description={`${open.length} aberta(s), ${resolved.length} resolvida(s).`}
    >
      {disputes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <ShieldCheck className="h-10 w-10 text-emerald-600" />
            <h2 className="text-lg font-semibold">Nenhuma disputa</h2>
            <p className="text-sm text-muted-foreground">Tudo em ordem.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-cards">
                <thead className="border-b border-border bg-secondary/40">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cliente / Profissional
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Serviço
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cidade
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Categoria
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Valor
                    </th>
                    <SortableTh field="status" label="Status" basePath={basePath} />
                    <SortableTh field="createdAt" label="Aberta em" basePath={basePath} />
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {disputes.map((d) => {
                    const isOpen = d.status === 'OPEN' || d.status === 'UNDER_REVIEW';
                    return (
                      <tr key={d.id} className={'hover:bg-secondary/30 ' + (isOpen ? 'bg-amber-50/40' : '')}>
                        <td className="px-3 py-3">
                          <div>
                            <Link
                              href={`/admin/usuarios/${d.booking.client.id}`}
                              className="font-medium hover:underline"
                            >
                              {d.booking.client.name}
                            </Link>
                            <div className="text-xs text-muted-foreground">vs</div>
                            <Link
                              href={`/admin/usuarios/${d.booking.professional.user.id}`}
                              className="text-xs hover:underline"
                            >
                              {d.booking.professional.user.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs">{d.booking.service.title}</td>
                        <td className="px-3 py-3 text-xs">
                          {d.booking.professional.city
                            ? `${d.booking.professional.city}/${d.booking.professional.state ?? ''}`
                            : '—'}
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {d.booking.service.category?.name ? (
                            <Badge variant="soft" className="text-[10px]">
                              {d.booking.service.category.name}
                            </Badge>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold">
                          {formatBRL(Number(d.booking.totalAmount))}
                        </td>
                        <td className="px-3 py-3 text-xs">
                          <Badge variant={isOpen ? 'soft' : 'success'}>{d.status}</Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                          {d.createdAt.toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <DisputeActions
                            dispute={{
                              id: d.id,
                              isOpen,
                              reason: d.reason,
                              clientPhone: d.booking.client.phone,
                              clientName: d.booking.client.name,
                              proName: d.booking.professional.user.name,
                              total: Number(d.booking.totalAmount),
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
