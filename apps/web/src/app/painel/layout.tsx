import { redirect } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  History,
  LayoutDashboard,
  MessageCircle,
  Search,
} from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { PanelLayout, PanelSidebar, type SidebarSection } from '@/components/layout/panel-sidebar';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/entrar?next=/painel');

  const [unreadMsgs, unreadNotif] = await Promise.all([
    prisma.conversation.aggregate({
      where: { clientId: session.user.id },
      _sum: { unreadByClient: true },
    }),
    prisma.notification.count({ where: { userId: session.user.id, readAt: null } }),
  ]);

  const sections: SidebarSection[] = [
    {
      items: [
        { href: '/painel', label: 'Visão geral', icon: LayoutDashboard, exact: true },
        { href: '/painel/agendamentos', label: 'Agendamentos', icon: CalendarDays },
        { href: '/painel/historico', label: 'Histórico', icon: History },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        {
          href: '/mensagens',
          label: 'Mensagens',
          icon: MessageCircle,
          badge: unreadMsgs._sum.unreadByClient ?? 0,
        },
        { href: '/painel/notificacoes', label: 'Notificações', icon: Bell, badge: unreadNotif },
      ],
    },
    {
      title: 'Plataforma',
      items: [{ href: '/buscar', label: 'Buscar profissionais', icon: Search }],
    },
  ];

  return (
    <PanelLayout
      sidebar={
        <PanelSidebar title="Cliente" subtitle={session.user.name ?? undefined} sections={sections} />
      }
    >
      {children}
    </PanelLayout>
  );
}
