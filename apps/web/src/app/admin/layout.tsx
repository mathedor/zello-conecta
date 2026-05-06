import { redirect } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Briefcase,
  FileCheck,
  LayoutGrid,
  MessageCircle,
  ShieldAlert,
  UsersRound,
  Wallet,
} from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { PanelLayout, PanelSidebar, type SidebarSection } from '@/components/layout/panel-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  const [kycPending, withdrawPending, disputes, unreadNotif] = await Promise.all([
    prisma.user.count({ where: { kycStatus: 'SUBMITTED' } }),
    prisma.withdrawTicket.count({ where: { status: 'REQUESTED' } }),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
    prisma.notification.count({ where: { userId: session.user.id, readAt: null } }),
  ]);

  const sections: SidebarSection[] = [
    {
      items: [
        { href: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
        { href: '/admin/usuarios', label: 'Usuários', icon: UsersRound },
        { href: '/admin/profissionais', label: 'Profissionais', icon: Briefcase },
      ],
    },
    {
      title: 'Operacional',
      items: [
        { href: '/admin/kyc', label: 'KYC pendente', icon: FileCheck, badge: kycPending },
        { href: '/admin/saques', label: 'Saques', icon: Wallet, badge: withdrawPending },
        { href: '/admin/disputas', label: 'Disputas', icon: ShieldAlert, badge: disputes },
      ],
    },
    {
      title: 'Plataforma',
      items: [
        { href: '/admin/categorias', label: 'Categorias', icon: LayoutGrid },
        { href: '/mensagens', label: 'Mensagens', icon: MessageCircle },
        { href: '/painel/notificacoes', label: 'Notificações', icon: Bell, badge: unreadNotif },
      ],
    },
  ];

  return (
    <PanelLayout
      sidebar={<PanelSidebar title="Admin" subtitle={session.user.name ?? undefined} sections={sections} />}
    >
      {children}
    </PanelLayout>
  );
}
