import { notFound, redirect } from 'next/navigation';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LOCATION_MODE_LABELS } from '@/lib/service-schemas';
import { formatBRL } from '@/lib/pricing';
import { CheckoutFlow } from './checkout-flow';

export const metadata = { title: 'Pagamento' };

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { bookingId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/entrar?next=/checkout/${bookingId}`);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { title: true, durationMin: true } },
      professional: { include: { user: { select: { name: true } } } },
      payment: true,
    },
  });

  if (!booking) notFound();
  if (booking.clientId !== session.user.id) redirect('/painel');

  if (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED') {
    redirect(`/checkout/${bookingId}/sucesso`);
  }

  return (
    <main className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pagamento</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reserva <code className="font-mono">{booking.reference}</code> · valor retido até a
            conclusão do serviço.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="p-6 md:p-8">
              <CheckoutFlow
                bookingId={booking.id}
                totalAmount={Number(booking.totalAmount)}
                existingPayment={
                  booking.payment
                    ? {
                        id: booking.payment.id,
                        method: booking.payment.method,
                        status: booking.payment.status,
                        qrCode: booking.payment.efiQrCode,
                        qrCodeImageUrl: booking.payment.efiQrCodeImageUrl,
                        copyPaste: booking.payment.efiCopyPaste,
                        expiresAt: booking.payment.efiExpiresAt
                          ? booking.payment.efiExpiresAt.toISOString()
                          : null,
                      }
                    : null
                }
              />
            </CardContent>
          </Card>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="p-6">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Resumo da reserva
                </div>
                <h3 className="mt-1 text-base font-semibold">{booking.service.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  com {booking.professional.user.name}
                </p>

                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-zello-600" />
                    <span>
                      {booking.scheduledAt.toLocaleString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zello-600" />
                    <span>{booking.service.durationMin} minutos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zello-600" />
                    <span>{LOCATION_MODE_LABELS[booking.locationMode]}</span>
                  </li>
                </ul>

                <div className="my-5 h-px bg-border" />

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Serviço</dt>
                    <dd>{formatBRL(Number(booking.servicePrice))}</dd>
                  </div>
                  {Number(booking.travelFee) > 0 ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Deslocamento</dt>
                      <dd>{formatBRL(Number(booking.travelFee))}</dd>
                    </div>
                  ) : null}
                  <div className="flex items-baseline justify-between border-t border-border pt-3">
                    <dt className="font-medium">Total</dt>
                    <dd className="text-2xl font-bold text-zello-600">
                      {formatBRL(Number(booking.totalAmount))}
                    </dd>
                  </div>
                </dl>

                <Badge variant="soft" className="mt-5 w-full justify-center py-1.5">
                  Pagamento retido até a conclusão
                </Badge>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
