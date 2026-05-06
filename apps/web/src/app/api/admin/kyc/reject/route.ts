import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { sendEmail, kycRejectedEmail } from '@/lib/mailer';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Motivo inválido', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { userId, reason } = parsed.data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus: 'REJECTED',
      kycReviewedAt: new Date(),
      kycRejectReason: reason,
      documents: {
        updateMany: {
          where: { status: 'SUBMITTED' },
          data: { status: 'REJECTED', notes: reason },
        },
      },
    },
    select: { name: true, email: true },
  });

  void sendEmail({
    to: user.email,
    subject: 'Sua documentação precisa de ajustes — Zello Conecta',
    html: kycRejectedEmail(user.name, reason),
  });

  return NextResponse.json({ ok: true });
}
