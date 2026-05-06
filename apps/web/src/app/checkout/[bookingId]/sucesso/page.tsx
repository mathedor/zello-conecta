import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatBRL } from '@/lib/pricing';

export const metadata = { title: 'Reserva confirmada' };

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function SucessoPage({ params }: PageProps) {
  const { bookingId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/entrar?next=/checkout/${bookingId}/sucesso`);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { title: true } },
      professional: { include: { user: { select: { name: true } } } },
    },
  });

  if (!booking) notFound();
  if (booking.clientId !== session.user.id) redirect('/painel');

  return (
    <main className="container py-12 md:py-20">
      <div className="mx-auto max-w-xl">
        <Card>
          <CardContent className="flex flex-col items-center gap-5 p-8 text-center md:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Reserva confirmada!</h1>
            <p className="max-w-md text-base text-muted-foreground">
              Seu pagamento foi recebido e o profissional já foi notificado. O valor fica retido pela
              Zello até você confirmar a conclusão do serviço (ou liberação automática 48h após o
              término).
            </p>

            <div className="w-full rounded-2xl border border-border bg-secondary/40 p-5 text-left">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Detalhes</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-zello-600" />
                  <span>
                    {booking.scheduledAt.toLocaleString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>Serviço: <strong>{booking.service.title}</strong></div>
                <div>
                  Profissional: <strong>{booking.professional.user.name}</strong>
                </div>
                <div>
                  Valor: <strong>{formatBRL(Number(booking.totalAmount))}</strong>
                </div>
                <div>
                  Referência: <code className="rounded bg-card px-1 py-0.5 text-xs">{booking.reference}</code>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/painel/agendamentos">
                  Meus agendamentos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/buscar">Continuar explorando</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
