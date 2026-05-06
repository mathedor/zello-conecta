import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { reviewSchema } from '@/lib/finance-schemas';
import { sendEmail, emailLayout, escapeHtml } from '@/lib/mailer';
import { notify } from '@/lib/notify';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      review: true,
      service: { select: { title: true } },
      professional: { include: { user: { select: { id: true, email: true, name: true } } } },
    },
  });
  if (!booking || booking.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
  }
  if (booking.status !== 'COMPLETED') {
    return NextResponse.json(
      { error: 'Só é possível avaliar serviços concluídos' },
      { status: 409 },
    );
  }
  if (booking.review) {
    return NextResponse.json({ error: 'Você já avaliou esta reserva' }, { status: 409 });
  }

  const { rating, comment } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        bookingId: booking.id,
        authorId: session.user.id,
        rating,
        comment: comment || null,
      },
    });

    const stats = await tx.review.aggregate({
      where: { hidden: false, booking: { professionalId: booking.professionalId } },
      _avg: { rating: true },
      _count: { id: true },
    });

    await tx.professional.update({
      where: { id: booking.professionalId },
      data: {
        averageRating: stats._avg.rating ?? 0,
        totalReviews: stats._count.id,
      },
    });
  });

  void notify({
    userId: booking.professional.user.id,
    bookingId: booking.id,
    type: 'REVIEW_RECEIVED',
    title: `Você recebeu uma avaliação ${rating}★`,
    body: comment ? comment : `Em ${booking.service.title}`,
  });

  void sendEmail({
    to: booking.professional.user.email,
    subject: `Nova avaliação ${rating}★ — ${booking.service.title}`,
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-size:20px;font-weight:600;">Você recebeu uma avaliação ${rating}★</h1>
      <p style="margin:0 0 12px;">Serviço: <strong>${escapeHtml(booking.service.title)}</strong></p>
      ${comment ? `<blockquote style="margin:16px 0;padding:16px;background:#f9fafb;border-left:4px solid #1d36f5;border-radius:8px;">${escapeHtml(comment)}</blockquote>` : ''}`,
      'Nova avaliação',
    ),
  });

  return NextResponse.json({ ok: true });
}
