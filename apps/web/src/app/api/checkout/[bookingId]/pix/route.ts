import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { getEfiClient } from '@/lib/efi';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { bookingId } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { client: { select: { id: true, name: true, cpf: true, email: true } } },
  });
  if (!booking || booking.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
  }
  if (booking.status !== 'PENDING_PAYMENT') {
    return NextResponse.json({ error: 'Reserva já paga ou cancelada' }, { status: 409 });
  }

  const existingPaid = await prisma.payment.findFirst({
    where: { bookingId, status: { in: ['PAID', 'PROCESSING'] } },
  });
  if (existingPaid) {
    return NextResponse.json({ error: 'Pagamento em andamento ou pago' }, { status: 409 });
  }

  await prisma.payment.deleteMany({
    where: { bookingId, status: { in: ['PENDING', 'FAILED', 'CANCELLED'] } },
  });

  const efi = getEfiClient();
  const charge = await efi.createPixCharge({
    amount: Number(booking.totalAmount),
    description: `Zello Conecta — Reserva ${booking.reference}`,
    externalId: booking.reference,
    customer: {
      name: booking.client.name,
      cpf: booking.client.cpf ?? null,
      email: booking.client.email,
    },
    expiresInSeconds: 3600,
    webhookUrl: `${env.APP_URL}/api/webhooks/efi`,
  });

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      method: 'PIX',
      status: 'PENDING',
      amount: booking.totalAmount,
      currency: 'BRL',
      efiTxId: charge.txId,
      efiQrCode: charge.qrCode,
      efiQrCodeImageUrl: charge.qrCodeImageUrl,
      efiCopyPaste: charge.copyPaste,
      efiExpiresAt: charge.expiresAt,
      escrowStatus: 'HELD',
    },
  });

  return NextResponse.json({
    payment: {
      id: payment.id,
      txId: payment.efiTxId,
      qrCode: payment.efiQrCode,
      qrCodeImageUrl: payment.efiQrCodeImageUrl,
      copyPaste: payment.efiCopyPaste,
      expiresAt: payment.efiExpiresAt,
      isMock: efi.isMock,
    },
  });
}
