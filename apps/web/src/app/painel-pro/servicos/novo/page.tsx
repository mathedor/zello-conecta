import { redirect } from 'next/navigation';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceForm } from '@/components/painel-pro/service-form';

export const metadata = { title: 'Novo serviço' };

export default async function NovoServicoPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar');

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) redirect('/painel-pro');

  return (
    <DashboardShell
      title="Novo serviço"
      description="Capriche na descrição e nas fotos — clientes decidem rapidamente."
    >
      <Card>
        <CardContent className="p-6 md:p-8">
          <ServiceForm />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
