import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSidebarConfig } from '@/lib/sidebar-for-role';
import { PanelLayout, PanelSidebar } from '@/components/layout/panel-sidebar';

export default async function NotificacoesLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/entrar?next=/notificacoes');

  const config = await getSidebarConfig(session);

  return (
    <PanelLayout
      sidebar={
        <PanelSidebar
          title={config.title}
          subtitle={config.subtitle}
          sections={config.sections}
        />
      }
    >
      {children}
    </PanelLayout>
  );
}
