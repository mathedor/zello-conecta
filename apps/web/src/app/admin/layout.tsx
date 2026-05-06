import { redirect } from 'next/navigation';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import {
  PanelLayout,
  PanelSidebar,
  type SidebarSection,
} from '@/components/layout/panel-sidebar';

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
      title: 'Plataforma',
      items: [
        { href: '/admin/categorias', label: 'Categorias', iconName: 'LayoutGrid' },
        { href: '/mensagens', label: 'Mensagens', iconName: 'MessageCircle' },
        {
          href: '/painel/notificacoes',
          label: 'Notificações',
          iconName: 'Bell',
          badge: unreadNotif,
        },
      ],
    },
  ];

  return (
    <PanelLayout
      sidebar={
        <PanelSidebar
          title="Admin"
          subtitle={session.user.name ?? undefined}
          sections={sections}
        />
      }
    >
      {children}
    </PanelLayout>
  );
}
