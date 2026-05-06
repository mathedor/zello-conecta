import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  FileCheck,
  ShieldAlert,
  TrendingUp,
  UsersRound,
  Wallet,
} from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { getAdminStats } from '@/lib/admin-stats';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingsAreaChart, CategoriesBarChart } from '@/components/admin/charts';
import { formatBRL } from '@/lib/pricing';

export const metadata = { title: 'Admin' };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  const [stats, kycPending, withdrawPending, disputes] = await Promise.all([
    getAdminStats(),
    prisma.user.count({ where: { kycStatus: 'SUBMITTED' } }),
    prisma.withdrawTicket.count({ where: { status: 'REQUESTED' } }),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
  ]);

  const operationalCards = [
    { icon: UsersRound, label: 'Usuários', value: stats.totals.users, href: '/admin/usuarios' },
    { icon: FileCheck, label: 'KYC pendente', value: kycPending, href: '/admin/kyc' },
    { icon: Wallet, label: 'Saques pendentes', value: withdrawPending, href: '/admin/saques' },
    { icon: ShieldAlert, label: 'Disputas', value: disputes, href: '/admin/disputas' },
  ];

  return (
    <DashboardShell title="Painel administrativo" description="Visão geral da plataforma.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          label="GMV total"
          value={formatBRL(stats.totals.grossSales)}
          delta={stats.weekGrowth.grossSales}
          deltaLabel="esta semana"
          isMoney
        />
        <MetricCard
          icon={CheckCircle2}
          label="Reservas concluídas"
          value={stats.totals.completedBookings.toString()}
          delta={stats.weekGrowth.newBookings}
          deltaLabel="esta semana"
        />
        <MetricCard
          icon={UsersRound}
          label="Profissionais ativos"
          value={`${stats.totals.activeProfessionals} / ${stats.totals.professionals}`}
          delta={stats.weekGrowth.newUsers}
          deltaLabel="novos cadastros"
        />
        <MetricCard
          icon={TrendingUp}
          label="Comissão acumulada"
          value={formatBRL(stats.totals.platformFee)}
          isMoney
          subtext={`Ticket médio ${formatBRL(stats.totals.averageTicket)}`}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Reservas — últimos 30 dias</h2>
                <p className="text-xs text-muted-foreground">Volume diário (todos os status)</p>
              </div>
              <Badge variant="soft">Live</Badge>
            </div>
            <BookingsAreaChart data={stats.bookingsByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">Top categorias</h2>
            <p className="text-xs text-muted-foreground">Concluídas no período</p>
            <div className="mt-4">
              {stats.topCategories.length > 0 ? (
                <CategoriesBarChart data={stats.topCategories} />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">Sem dados ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {operationalCards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-zello-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3 text-muted-foreground">
              <c.icon className="h-5 w-5 text-zello-600" />
              <span className="text-sm font-medium">{c.label}</span>
            </div>
            <div className="mt-3 text-3xl font-bold">{c.value}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-zello-600 group-hover:gap-2 transition-all">
              Abrir <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Atividade recente</h2>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem atividade recente.</p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recentActivity.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(a.date).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  isMoney,
  subtext,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  isMoney?: boolean;
  subtext?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon className="h-5 w-5 text-zello-600" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
        {typeof delta === 'number' && deltaLabel ? (
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            {isMoney ? `+${formatBRL(delta)}` : `+${delta}`}
            <span className="text-muted-foreground"> · {deltaLabel}</span>
          </div>
        ) : subtext ? (
          <p className="mt-2 text-xs text-muted-foreground">{subtext}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
