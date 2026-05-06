import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { ArrowRight, Calendar, ImagePlus, Search } from 'lucide-react';
import { prisma, type BookingStatus } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBRL } from '@/lib/pricing';
import { ClientBookingActions } from './client-booking-actions';

export const metadata = { title: 'Meus agendamentos' };

const STATUS_LABEL: Record<BookingStatus, { label: string; tone: 'soft' | 'success' | 'outline' | 'default' }> = {
  PENDING_PAYMENT: { label: 'Aguardando pagamento', tone: 'outline' },
  CONFIRMED: { label: 'Confirmado', tone: 'success' },
  IN_PROGRESS: { label: 'Em andamento', tone: 'default' },
  COMPLETED: { label: 'Concluído', tone: 'soft' },
  CANCELLED: { label: 'Cancelado', tone: 'outline' },
  DISPUTED: { label: 'Em disputa', tone: 'outline' },
  REFUNDED: { label: 'Reembolsado', tone: 'outline' },
};

export default async function AgendamentosPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar?next=/painel/agendamentos');

  const bookings = await prisma.booking.findMany({
    where: { clientId: session.user.id },
    include: {
      service: { include: { photos: { take: 1, orderBy: { order: 'asc' } } } },
      professional: { include: { user: { select: { name: true, avatarUrl: true } } } },
      payment: { select: { status: true, method: true } },
      review: { select: { id: true } },
      dispute: { select: { id: true, status: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  });

  return (
    <DashboardShell
      title="Meus agendamentos"
      description="Suas reservas atuais e o histórico de serviços contratados."
      actions={
        <Button asChild>
          <Link href="/buscar">
            <Search className="h-4 w-4" />
            Buscar profissionais
          </Link>
        </Button>
      }
    >
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Calendar className="h-12 w-12 text-zello-600" />
            <h2 className="text-xl font-semibold">Nenhuma reserva ainda</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Quando você contratar um serviço, ele aparece aqui.
            </p>
            <Button asChild className="mt-2">
              <Link href="/buscar">
                Explorar serviços
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const cover = b.service.photos[0]?.url;
            const status = STATUS_LABEL[b.status];
            return (
              <Card key={b.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-secondary sm:h-20 sm:w-32">
                    {cover ? (
                      <Image src={cover} alt={b.service.title} fill sizes="128px" className="object-cover" unoptimized />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={status.tone}>{status.label}</Badge>
                      <code className="text-xs text-muted-foreground">{b.reference}</code>
                    </div>
                    <h3 className="mt-1.5 truncate text-base font-semibold">{b.service.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      com {b.professional.user.name} ·{' '}
                      {b.scheduledAt.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="mt-2 text-sm">
                      Total <strong>{formatBRL(Number(b.totalAmount))}</strong>
                    </div>
                  </div>
                  <ClientBookingActions
                    bookingId={b.id}
                    status={b.status}
                    hasReview={!!b.review}
                    hasDispute={!!b.dispute}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
