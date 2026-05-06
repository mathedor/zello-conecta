import { notFound, redirect } from 'next/navigation';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewForm } from './review-form';

export const metadata = { title: 'Avaliar serviço' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AvaliarPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/entrar?next=/painel/agendamentos/${id}/avaliar`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: { select: { title: true } },
      professional: { include: { user: { select: { name: true } } } },
      review: true,
    },
  });
  if (!booking) notFound();
  if (booking.clientId !== session.user.id) redirect('/painel/agendamentos');
  if (booking.status !== 'COMPLETED') redirect('/painel/agendamentos');
  if (booking.review) redirect('/painel/agendamentos');

  return (
    <DashboardShell
      title="Avaliar serviço"
      description="Sua avaliação ajuda outros clientes a contratarem com confiança."
    >
      <div className="mx-auto max-w-xl">
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">{booking.service.title}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                com {booking.professional.user.name}
              </p>
            </div>
            <ReviewForm bookingId={booking.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
