import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { adminWithdrawRejectSchema } from '@/lib/finance-schemas';
import { sendEmail, emailLayout, escapeHtml } from '@/lib/mailer';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = adminWithdrawRejectSchema.safeParse(body);
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
  if (ticket.status === 'PAID' || ticket.status === 'REJECTED') {
    return NextResponse.json({ error: 'Ticket já processado' }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.withdrawTicket.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectReason: parsed.data.reason,
        processedAt: new Date(),
        processedById: session.user.id,
      },
    }),
    prisma.professional.update({
      where: { id: ticket.professionalId },
      data: { balanceAvailable: { increment: ticket.amount } },
    }),
  ]);

  void sendEmail({
    to: ticket.professional.user.email,
    subject: 'Saque não foi processado — Zello Conecta',
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-size:20px;font-weight:600;">Olá, ${escapeHtml(ticket.professional.user.name)}</h1>
      <p>Seu pedido de saque de R$ ${Number(ticket.amount).toFixed(2)} não pôde ser processado:</p>
      <blockquote style="margin:16px 0;padding:16px;background:#fef3f2;border-left:4px solid #f04438;border-radius:8px;">${escapeHtml(parsed.data.reason)}</blockquote>
      <p>O valor voltou para o seu saldo disponível. Você pode solicitar um novo saque com os dados corretos.</p>`,
      'Saque rejeitado',
    ),
  });

  return NextResponse.json({ ok: true });
}
