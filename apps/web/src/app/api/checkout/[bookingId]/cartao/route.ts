import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { cardChargeSchema } from '@/lib/booking-schemas';
import { getEfiClient } from '@/lib/efi';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { bookingId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = cardChargeSchema.safeParse({ ...body, bookingId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { client: { select: { name: true, cpf: true, email: true } } },
  });
  if (!booking || booking.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
  }
  if (booking.status !== 'PENDING_PAYMENT') {
    return NextResponse.json({ error: 'Reserva já paga ou cancelada' }, { status: 409 });
  }

  await prisma.payment.deleteMany({
    where: { bookingId, status: { in: ['PENDING', 'FAILED', 'CANCELLED'] } },
  });

  const efi = getEfiClient();
  const charge = await efi.createCardCharge({
    amount: Number(booking.totalAmount),
    description: `Zello Conecta — Reserva ${booking.reference}`,
    externalId: booking.reference,
    customer: {
      name: booking.client.name,
      cpf: booking.client.cpf ?? null,
      email: booking.client.email,
    },
    paymentToken: parsed.data.paymentToken,
    installments: parsed.data.installments,
  });

  const paymentStatus = charge.status === 'PAID' ? 'PAID' : charge.status === 'PROCESSING' ? 'PROCESSING' : 'FAILED';

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      method: 'CARD',
      status: paymentStatus,
      amount: booking.totalAmount,
      currency: 'BRL',
      efiTxId: charge.txId,
      paidAt: paymentStatus === 'PAID' ? new Date() : null,
      failedReason: paymentStatus === 'FAILED' ? charge.message ?? 'recusado' : null,
      escrowStatus: 'HELD',
    },
  });

  if (paymentStatus === 'PAID') {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });
  }

  return NextResponse.json({
    payment: {
      id: payment.id,
      status: payment.status,
      message: charge.message,
      isMock: efi.isMock,
    },
  });
}
