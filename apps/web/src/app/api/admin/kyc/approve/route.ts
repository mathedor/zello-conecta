import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { sendEmail, kycApprovedEmail } from '@/lib/mailer';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({ userId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

  const { userId } = parsed.data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus: 'APPROVED',
      kycReviewedAt: new Date(),
      kycRejectReason: null,
      documents: {
        updateMany: {
          where: { status: 'SUBMITTED' },
          data: { status: 'APPROVED' },
        },
      },
    },
    select: { name: true, email: true },
  });

  void sendEmail({
    to: user.email,
    subject: 'KYC aprovado — Zello Conecta',
    html: kycApprovedEmail(user.name),
  });

  return NextResponse.json({ ok: true });
}
