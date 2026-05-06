import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, FileCheck, ShieldAlert, UsersRound, Wallet } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Admin' };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  const [users, kycPending, withdrawPending, disputes] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { kycStatus: 'SUBMITTED' } }),
    prisma.withdrawTicket.count({ where: { status: 'REQUESTED' } }),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
  ]);

  const cards = [
    { icon: UsersRound, label: 'Usuários cadastrados', value: users, href: '/admin/usuarios' },
    { icon: FileCheck, label: 'KYC pendente', value: kycPending, href: '/admin/kyc' },
    { icon: Wallet, label: 'Tickets de saque', value: withdrawPending, href: '/admin/saques' },
    { icon: ShieldAlert, label: 'Disputas abertas', value: disputes, href: '/admin/disputas' },
  ];

  return (
    <DashboardShell title="Painel administrativo" description="Visão geral da plataforma.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
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
              Ver detalhes <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Próximos painéis</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dashboard com gráficos comparativos (semanais, mensais), busca avançada de usuários,
            relatórios financeiros e auditoria de logs estarão disponíveis nas próximas fases.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
