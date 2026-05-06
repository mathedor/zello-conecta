import { prisma } from '@zello/db';
import { type Session } from 'next-auth';
import { type SidebarSection } from '@/components/layout/panel-sidebar';

export interface SidebarConfig {
  title: string;
  subtitle?: string;
  sections: SidebarSection[];
}

export async function getSidebarConfig(session: Session): Promise<SidebarConfig> {
  const role = session.user.role;
  const userId = session.user.id;
  const subtitle = session.user.name ?? undefined;

  if (role === 'ADMIN') {
    const [kycPending, withdrawPending, disputes, unreadNotif] = await Promise.all([
      prisma.user.count({ where: { kycStatus: 'SUBMITTED' } }),
      prisma.withdrawTicket.count({ where: { status: 'REQUESTED' } }),
      prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return {
      title: 'Admin',
      subtitle,
      sections: [
        {
          items: [
            { href: '/admin', label: 'Dashboard', iconName: 'BarChart3', exact: true },
            { href: '/admin/usuarios', label: 'Usuários', iconName: 'UsersRound' },
            { href: '/admin/profissionais', label: 'Profissionais', iconName: 'Briefcase' },
          ],
        },
        {
          title: 'Operacional',
          items: [
            { href: '/admin/kyc', label: 'KYC pendente', iconName: 'Shield', badge: kycPending },
            { href: '/admin/saques', label: 'Saques', iconName: 'Wallet', badge: withdrawPending },
            { href: '/admin/disputas', label: 'Disputas', iconName: 'ShieldAlert', badge: disputes },
          ],
        },
        {
          title: 'Relatórios',
          items: [
            { href: '/admin/relatorios', label: 'Visão geral', iconName: 'PieChart', exact: true },
            { href: '/admin/relatorios/usuarios', label: 'Usuários', iconName: 'UsersRound' },
            { href: '/admin/relatorios/profissionais', label: 'Profissionais', iconName: 'Briefcase' },
            { href: '/admin/relatorios/cidades', label: 'Cidades', iconName: 'MapPin' },
            { href: '/admin/relatorios/estados', label: 'Estados', iconName: 'Map' },
            { href: '/admin/relatorios/servicos', label: 'Serviços', iconName: 'LayoutGrid' },
            { href: '/admin/relatorios/categorias', label: 'Categorias', iconName: 'Tag' },
          ],
        },
        {
          title: 'Plataforma',
          items: [
            { href: '/admin/categorias', label: 'Categorias', iconName: 'LayoutGrid' },
            { href: '/mensagens', label: 'Mensagens', iconName: 'MessageCircle' },
            { href: '/notificacoes', label: 'Notificações', iconName: 'Bell', badge: unreadNotif },
          ],
        },
      ],
    };
  }

  if (role === 'PROFESSIONAL') {
    const professional = await prisma.professional.findUnique({ where: { userId } });
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
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return {
      title: 'Profissional',
      subtitle,
      sections: [
        {
          items: [
            { href: '/painel-pro', label: 'Visão geral', iconName: 'LayoutDashboard', exact: true },
            { href: '/painel-pro/pedidos', label: 'Pedidos', iconName: 'Inbox', badge: pendingOrders },
            { href: '/painel-pro/servicos', label: 'Meus serviços', iconName: 'ListChecks' },
            { href: '/painel-pro/agenda', label: 'Agenda', iconName: 'CalendarRange' },
          ],
        },
        {
          title: 'Financeiro',
          items: [
            { href: '/painel-pro/financeiro', label: 'Saldo e saques', iconName: 'Banknote' },
            { href: '/painel-pro/kyc', label: 'Verificação', iconName: 'Shield' },
          ],
        },
        {
          title: 'Comunicação',
          items: [
            {
              href: '/mensagens',
              label: 'Mensagens',
              iconName: 'MessageCircle',
              badge: unreadMsgs._sum.unreadByProfessional ?? 0,
            },
            { href: '/notificacoes', label: 'Notificações', iconName: 'Bell', badge: unreadNotif },
          ],
        },
      ],
    };
  }

  // CLIENT
  const [unreadMsgs, unreadNotif] = await Promise.all([
    prisma.conversation.aggregate({
      where: { clientId: userId },
      _sum: { unreadByClient: true },
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return {
    title: 'Cliente',
    subtitle,
    sections: [
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
          { href: '/notificacoes', label: 'Notificações', iconName: 'Bell', badge: unreadNotif },
        ],
      },
      {
        title: 'Plataforma',
        items: [{ href: '/buscar', label: 'Buscar profissionais', iconName: 'Search' }],
      },
    ],
  };
}
