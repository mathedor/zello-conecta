import { redirect } from 'next/navigation';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import {
  PanelLayout,
  PanelSidebar,
  type SidebarSection,
} from '@/components/layout/panel-sidebar';

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
        { href: '/painel', label: 'Visão geral', iconName: 'LayoutDashboard', exact: true },
        { href: '/painel/agendamentos', label: 'Agendamentos', iconName: 'CalendarDays' },
        { href: '/painel/historico', label: 'Histórico', iconName: 'History' },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        {
          href: '/mensagens',
          label: 'Mensagens',
          iconName: 'MessageCircle',
          badge: unreadMsgs._sum.unreadByClient ?? 0,
        },
        {
          href: '/painel/notificacoes',
          label: 'Notificações',
          iconName: 'Bell',
          badge: unreadNotif,
        },
      ],
    },
    {
      title: 'Plataforma',
      items: [{ href: '/buscar', label: 'Buscar profissionais', iconName: 'Search' }],
    },
  ];

  return (
    <PanelLayout
      sidebar={
        <PanelSidebar
          title="Cliente"
          subtitle={session.user.name ?? undefined}
          sections={sections}
        />
      }
    >
      {children}
    </PanelLayout>
  );
}
