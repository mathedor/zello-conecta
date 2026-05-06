import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { sendEmail, emailLayout, escapeHtml } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PixWebhookEvent {
  endToEndId?: string;
  txid?: string;
  valor?: string;
  horario?: string;
}

interface WebhookPayload {
  pix?: PixWebhookEvent[];
  txId?: string;
  status?: string;
}

export async function POST(req: Request) {
  let body: WebhookPayload;
  try {
    body = (await req.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const events: { txId: string; isPaid: boolean }[] = [];
  if (Array.isArray(body.pix)) {
    for (const ev of body.pix) {
      if (ev.txid) events.push({ txId: ev.txid, isPaid: true });
    }
  } else if (body.txId) {
    events.push({ txId: body.txId, isPaid: body.status === 'PAID' || body.status === 'CONCLUIDA' });
  }

  for (const ev of events) {
    const payment = await prisma.payment.findUnique({ where: { efiTxId: ev.txId } });
    if (!payment) continue;
    if (payment.status === 'PAID') continue;
    if (!ev.isPaid) continue;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', paidAt: new Date() },
      });
      const booking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
        include: {
          client: { select: { name: true, email: true } },
          professional: { include: { user: { select: { name: true, email: true } } } },
          service: { select: { title: true } },
        },
      });

      void sendEmail({
        to: booking.client.email,
        subject: `Reserva confirmada — ${booking.service.title}`,
        html: bookingConfirmedClient(booking),
      });
      void sendEmail({
        to: booking.professional.user.email,
        subject: `Nova reserva paga — ${booking.service.title}`,
        html: bookingConfirmedPro(booking),
      });
    });
  }

  return NextResponse.json({ ok: true, processed: events.length });
}

function bookingConfirmedClient(b: {
  reference: string;
  scheduledAt: Date;
  service: { title: string };
  professional: { user: { name: string } };
}) {
  return emailLayout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;">Pagamento confirmado!</h1>
    <p>Sua reserva está confirmada para o serviço <strong>${escapeHtml(b.service.title)}</strong> com ${escapeHtml(b.professional.user.name)} em <strong>${b.scheduledAt.toLocaleString('pt-BR')}</strong>.</p>
    <p>Referência: <code>${escapeHtml(b.reference)}</code></p>`,
    'Pagamento confirmado',
  );
}

function bookingConfirmedPro(b: {
  reference: string;
  scheduledAt: Date;
  service: { title: string };
  client: { name: string };
}) {
  return emailLayout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;">Nova reserva confirmada!</h1>
    <p><strong>${escapeHtml(b.client.name)}</strong> contratou <strong>${escapeHtml(b.service.title)}</strong> para <strong>${b.scheduledAt.toLocaleString('pt-BR')}</strong>.</p>
    <p>Referência: <code>${escapeHtml(b.reference)}</code></p>`,
    'Nova reserva',
  );
}
