import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { notify } from '@/lib/notify';

export const runtime = 'nodejs';

const schema = z.object({
  resolution: z.enum(['REFUNDED', 'RELEASED']),
  notes: z.string().min(10).max(2000),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          payment: true,
          professional: { select: { id: true, userId: true } },
        },
      },
    },
  });
  if (!dispute) return NextResponse.json({ error: 'Disputa não encontrada' }, { status: 404 });
  if (dispute.status === 'RESOLVED_REFUNDED' || dispute.status === 'RESOLVED_RELEASED') {
    return NextResponse.json({ error: 'Disputa já resolvida' }, { status: 409 });
  }

  const isRefund = parsed.data.resolution === 'REFUNDED';
  const newDisputeStatus = isRefund ? 'RESOLVED_REFUNDED' : 'RESOLVED_RELEASED';
  const newBookingStatus = isRefund ? 'REFUNDED' : 'COMPLETED';

  await prisma.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id },
      data: {
        status: newDisputeStatus,
        resolution: parsed.data.notes,
        resolvedAt: new Date(),
      },
    });
    await tx.booking.update({
      where: { id: dispute.bookingId },
      data: { status: newBookingStatus },
    });
    if (dispute.booking.payment) {
      await tx.payment.update({
        where: { id: dispute.booking.payment.id },
        data: { escrowStatus: isRefund ? 'REFUNDED' : 'RELEASED' },
      });
    }
    if (!isRefund && dispute.booking.payment?.status === 'PAID') {
      await tx.professional.update({
        where: { id: dispute.booking.professional.id },
        data: {
          balanceAvailable: { increment: dispute.booking.netToProvider },
          totalCompleted: { increment: 1 },
          totalEarned: { increment: dispute.booking.netToProvider },
        },
      });
    }
  });

  void notify({
    userId: dispute.openedById,
    type: 'DISPUTE_RESOLVED',
    bookingId: dispute.bookingId,
    title: isRefund ? 'Disputa resolvida — reembolso aprovado' : 'Disputa resolvida — pagamento liberado',
    body: parsed.data.notes,
  });
  void notify({
    userId: dispute.booking.professional.userId,
    type: 'DISPUTE_RESOLVED',
    bookingId: dispute.bookingId,
    title: isRefund ? 'Disputa resolvida — reembolso ao cliente' : 'Disputa resolvida — pagamento liberado',
    body: parsed.data.notes,
  });

  return NextResponse.json({ ok: true });
}
