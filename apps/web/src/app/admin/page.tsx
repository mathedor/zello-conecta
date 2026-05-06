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
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { formatBRL } from '@/lib/pricing';

export const metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalUsers: number;
  totalProfessionals: number;
  activeProfessionals: number;
  totalBookings: number;
  completedBookings: number;
  grossSales: number;
  platformFee: number;
  averageTicket: number;
  newUsersWeek: number;
  newBookingsWeek: number;
  weekSales: number;
  kycPending: number;
  withdrawPending: number;
  disputesOpen: number;
}

async function loadStats(): Promise<DashboardStats> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalProfessionals,
    activeProfessionals,
    totalBookings,
    completedAgg,
    newUsersWeek,
    newBookingsWeek,
    weekSalesAgg,
    kycPending,
    withdrawPending,
    disputesOpen,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
    prisma.professional.count({
      where: { user: { kycStatus: 'APPROVED', status: 'ACTIVE' } },
    }),
    prisma.booking.count(),
    prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true, platformFee: true },
      _count: { id: true },
      _avg: { totalAmount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.booking.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.booking.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: weekAgo } },
      _sum: { totalAmount: true },
    }),
    prisma.user.count({ where: { kycStatus: 'SUBMITTED' } }),
    prisma.withdrawTicket.count({ where: { status: 'REQUESTED' } }),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
  ]);

  return {
    totalUsers,
    totalProfessionals,
    activeProfessionals,
    totalBookings,
    completedBookings: completedAgg._count.id,
    grossSales: Number(completedAgg._sum.totalAmount ?? 0),
    platformFee: Number(completedAgg._sum.platformFee ?? 0),
    averageTicket: Number(completedAgg._avg.totalAmount ?? 0),
    newUsersWeek,
    newBookingsWeek,
    weekSales: Number(weekSalesAgg._sum.totalAmount ?? 0),
    kycPending,
    withdrawPending,
    disputesOpen,
  };
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  const stats = await loadStats();

  const operationalCards = [
    { icon: UsersRound, label: 'Usuários', value: stats.totalUsers, href: '/admin/usuarios' },
    { icon: FileCheck, label: 'KYC pendente', value: stats.kycPending, href: '/admin/kyc' },
    {
      icon: Wallet,
      label: 'Saques pendentes',
      value: stats.withdrawPending,
      href: '/admin/saques',
    },
    { icon: ShieldAlert, label: 'Disputas', value: stats.disputesOpen, href: '/admin/disputas' },
  ];

  return (
    <DashboardShell title="Painel administrativo" description="Visão geral da plataforma.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          label="GMV total"
          value={formatBRL(stats.grossSales)}
          delta={stats.weekSales}
          deltaLabel="esta semana"
          isMoney
        />
        <MetricCard
          icon={CheckCircle2}
          label="Reservas concluídas"
          value={stats.completedBookings.toString()}
          delta={stats.newBookingsWeek}
          deltaLabel="esta semana"
        />
        <MetricCard
          icon={UsersRound}
          label="Profissionais ativos"
          value={`${stats.activeProfessionals} / ${stats.totalProfessionals}`}
          delta={stats.newUsersWeek}
          deltaLabel="novos cadastros"
        />
        <MetricCard
          icon={TrendingUp}
          label="Comissão acumulada"
          value={formatBRL(stats.platformFee)}
          isMoney
          subtext={`Ticket médio ${formatBRL(stats.averageTicket)}`}
        />
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

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold">Próximos passos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use a sidebar à esquerda para gerenciar usuários, KYC, saques, disputas e categorias.
            Gráficos comparativos voltam em breve.
          </p>
        </CardContent>
      </Card>
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
