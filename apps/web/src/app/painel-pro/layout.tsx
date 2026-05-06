import { redirect } from 'next/navigation';
import {
  Banknote,
  Bell,
  CalendarRange,
  Inbox,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  Shield,
  User,
} from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { PanelLayout, PanelSidebar, type SidebarSection } from '@/components/layout/panel-sidebar';

export default async function PainelProLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/entrar?next=/painel-pro');
  if (session.user.role !== 'PROFESSIONAL' && session.user.role !== 'ADMIN') redirect('/painel');

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });

  const [pendingOrders, unreadMsgs, unreadNotif] = await Promise.all([
    professional
      ? prisma.booking.count({
          where: {
            professionalId: professional.id,
            status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
          },
        })
      : Promise.resolve(0),
    professional
      ? prisma.conversation.aggregate({
          where: { professionalId: professional.id },
          _sum: { unreadByProfessional: true },
        })
      : Promise.resolve({ _sum: { unreadByProfessional: 0 } }),
    prisma.notification.count({ where: { userId: session.user.id, readAt: null } }),
  ]);

  const sections: SidebarSection[] = [
    {
      items: [
        { href: '/painel-pro', label: 'Visão geral', icon: LayoutDashboard, exact: true },
        { href: '/painel-pro/pedidos', label: 'Pedidos', icon: Inbox, badge: pendingOrders },
        { href: '/painel-pro/servicos', label: 'Meus serviços', icon: ListChecks },
        { href: '/painel-pro/agenda', label: 'Agenda', icon: CalendarRange },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        { href: '/painel-pro/financeiro', label: 'Saldo e saques', icon: Banknote },
        { href: '/painel-pro/kyc', label: 'Verificação', icon: Shield },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        {
          href: '/mensagens',
          label: 'Mensagens',
          icon: MessageCircle,
          badge: unreadMsgs._sum.unreadByProfessional ?? 0,
        },
        { href: '/painel/notificacoes', label: 'Notificações', icon: Bell, badge: unreadNotif },
      ],
    },
  ];

  return (
    <PanelLayout
      sidebar={
        <PanelSidebar
          title="Profissional"
          subtitle={session.user.name ?? undefined}
          sections={sections}
        />
      }
    >
      {children}
    </PanelLayout>
  );
}
