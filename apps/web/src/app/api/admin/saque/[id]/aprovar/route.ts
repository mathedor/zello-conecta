import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { adminWithdrawApproveSchema } from '@/lib/finance-schemas';
import { sendEmail, emailLayout, escapeHtml } from '@/lib/mailer';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = adminWithdrawApproveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const ticket = await prisma.withdrawTicket.findUnique({
    where: { id },
    include: {
      professional: { include: { user: { select: { name: true, email: true } } } },
    },
  });
  if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
  if (ticket.status === 'PAID') {
    return NextResponse.json({ error: 'Ticket já processado' }, { status: 409 });
  }

  await prisma.withdrawTicket.update({
    where: { id },
    data: {
      status: 'PAID',
      receiptUrl: parsed.data.receiptUrl,
      processedAt: new Date(),
      processedById: session.user.id,
    },
  });

  void sendEmail({
    to: ticket.professional.user.email,
    subject: `Saque processado — R$ ${Number(ticket.amount).toFixed(2)}`,
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-size:20px;font-weight:600;">Olá, ${escapeHtml(ticket.professional.user.name)}</h1>
      <p>Seu saque de <strong>R$ ${Number(ticket.amount).toFixed(2)}</strong> foi processado e enviado para sua chave PIX <code>${escapeHtml(ticket.pixKey ?? '')}</code>.</p>
      <p style="margin:16px 0;"><a href="${parsed.data.receiptUrl}" style="color:#1d36f5;">Ver comprovante</a></p>`,
      'Saque processado',
    ),
  });

  return NextResponse.json({ ok: true });
}
