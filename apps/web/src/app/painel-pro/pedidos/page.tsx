import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Calendar, ImagePlus, Inbox } from 'lucide-react';
import { prisma, type BookingStatus } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBRL } from '@/lib/pricing';

export const metadata = { title: 'Pedidos' };

const STATUS_TEXT: Record<BookingStatus, { label: string; tone: 'soft' | 'success' | 'outline' | 'default' }> = {
  PENDING_PAYMENT: { label: 'Aguardando pagamento', tone: 'outline' },
  CONFIRMED: { label: 'Confirmado', tone: 'success' },
  IN_PROGRESS: { label: 'Em andamento', tone: 'default' },
  COMPLETED: { label: 'Concluído', tone: 'soft' },
  CANCELLED: { label: 'Cancelado', tone: 'outline' },
  DISPUTED: { label: 'Em disputa', tone: 'outline' },
  REFUNDED: { label: 'Reembolsado', tone: 'outline' },
};

export default async function PedidosProPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar?next=/painel-pro/pedidos');

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) redirect('/painel-pro');

  const bookings = await prisma.booking.findMany({
    where: { professionalId: professional.id, status: { not: 'PENDING_PAYMENT' } },
    include: {
      service: { include: { photos: { take: 1, orderBy: { order: 'asc' } } } },
      client: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  });

  const upcoming = bookings.filter(
    (b) => b.scheduledAt > new Date() && ['CONFIRMED', 'IN_PROGRESS'].includes(b.status),
  );

  return (
    <DashboardShell
      title="Pedidos"
      description="Reservas pagas e histórico de serviços que você prestou."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Próximas reservas</div>
            <div className="mt-1 text-2xl font-bold">{upcoming.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Saldo disponível</div>
            <div className="mt-1 text-2xl font-bold text-zello-600">
              {formatBRL(Number(professional.balanceAvailable))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Em retenção</div>
            <div className="mt-1 text-2xl font-bold">
              {formatBRL(Number(professional.balancePending))}
            </div>
          </CardContent>
        </Card>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Inbox className="h-12 w-12 text-zello-600" />
            <h2 className="text-xl font-semibold">Sem pedidos ainda</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Quando alguém agendar um serviço seu, aparece aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const cover = b.service.photos[0]?.url;
            const status = STATUS_TEXT[b.status];
            return (
              <Card key={b.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                  <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-secondary sm:h-20 sm:w-28">
                    {cover ? (
                      <Image src={cover} alt={b.service.title} fill sizes="112px" className="object-cover" unoptimized />
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
                    <h3 className="mt-1.5 truncate font-semibold">{b.service.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      <Calendar className="mr-1 inline h-3 w-3" />
                      {b.scheduledAt.toLocaleString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="mt-2 grid gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                      <div>
                        Cliente: <strong className="text-foreground">{b.client.name}</strong>
                      </div>
                      {b.client.phone ? (
                        <div>
                          Tel: <Link href={`tel:${b.client.phone}`} className="text-zello-600 hover:underline">
                            {b.client.phone}
                          </Link>
                        </div>
                      ) : null}
                      <div>
                        Email: <Link href={`mailto:${b.client.email}`} className="text-zello-600 hover:underline">
                          {b.client.email}
                        </Link>
                      </div>
                      <div>
                        Você recebe: <strong className="text-zello-600">{formatBRL(Number(b.netToProvider))}</strong>
                      </div>
                    </div>
                    {b.notesFromClient ? (
                      <p className="mt-2 rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground">
                        💬 {b.notesFromClient}
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
