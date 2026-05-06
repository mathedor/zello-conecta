import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { getEfiClient } from '@/lib/efi';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const efi = getEfiClient();
  if (!efi.isMock) {
    return NextResponse.json({ error: 'Só disponível em modo mock' }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const paymentId = body?.paymentId as string | undefined;
  if (!paymentId) return NextResponse.json({ error: 'paymentId obrigatório' }, { status: 400 });

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { select: { clientId: true } } },
  });
  if (!payment) return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
  if (payment.booking.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  if (payment.status === 'PAID') return NextResponse.json({ ok: true, already: true });

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID', paidAt: new Date() },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
