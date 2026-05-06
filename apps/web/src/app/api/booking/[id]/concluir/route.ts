import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
  }
  if (!['CONFIRMED', 'IN_PROGRESS'].includes(booking.status)) {
    return NextResponse.json({ error: 'Status atual não permite conclusão' }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: {
        completedByClient: true,
        completedAt: new Date(),
        status: 'COMPLETED',
        autoReleaseAt: new Date(),
      },
    }),
    prisma.payment.updateMany({
      where: { bookingId: id, status: 'PAID', escrowStatus: 'HELD' },
      data: { escrowStatus: 'RELEASED' },
    }),
    prisma.professional.update({
      where: { id: booking.professionalId },
      data: {
        balanceAvailable: { increment: booking.netToProvider },
        totalCompleted: { increment: 1 },
        totalEarned: { increment: booking.netToProvider },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
