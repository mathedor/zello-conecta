import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({ reason: z.string().min(20).max(2000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Motivo inválido (mínimo 20 caracteres)' },
      { status: 400 },
    );
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
  }
  if (!['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)) {
    return NextResponse.json({ error: 'Status atual não permite disputa' }, { status: 409 });
  }

  const existing = await prisma.dispute.findUnique({ where: { bookingId: id } });
  if (existing) {
    return NextResponse.json({ error: 'Disputa já aberta para esta reserva' }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.dispute.create({
      data: {
        bookingId: id,
        openedById: session.user.id,
        reason: parsed.data.reason,
        status: 'OPEN',
      },
    }),
    prisma.booking.update({
      where: { id },
      data: { status: 'DISPUTED' },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
