import { redirect } from 'next/navigation';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceForm } from '@/components/painel-pro/service-form';

export const metadata = { title: 'Editar serviço' };

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/entrar');
  const { id } = await params;

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) redirect('/painel-pro');

  const service = await prisma.service.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: 'asc' } }, category: true },
  });

  if (!service || service.professionalId !== professional.id) {
    redirect('/painel-pro/servicos');
  }

  return (
    <DashboardShell title="Editar serviço" description={service.title}>
      <Card>
        <CardContent className="p-6 md:p-8">
          <ServiceForm
            initial={{
              id: service.id,
              title: service.title,
              description: service.description,
              priceMode: service.priceMode,
              price: Number(service.price),
              durationMin: service.durationMin,
              locationMode: service.locationMode,
              active: service.active,
              categoryId: service.categoryId,
              photos: service.photos.map((p) => p.url),
            }}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
