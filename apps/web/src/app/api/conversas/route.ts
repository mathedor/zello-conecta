import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { startConversationSchema } from '@/lib/messaging';
import { notify } from '@/lib/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const userId = session.user.id;
  const role = session.user.role;

  const conversations = await prisma.conversation.findMany({
    where:
      role === 'PROFESSIONAL'
        ? { professional: { userId } }
        : { clientId: userId },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      professional: {
        select: {
          id: true,
          slug: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      booking: { select: { id: true, reference: true, scheduledAt: true } },
    },
    take: 100,
  });

  const items = conversations.map((c) => ({
    id: c.id,
    bookingId: c.bookingId,
    bookingRef: c.booking?.reference ?? null,
    bookingDate: c.booking?.scheduledAt?.toISOString() ?? null,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt.toISOString(),
    unread: role === 'PROFESSIONAL' ? c.unreadByProfessional : c.unreadByClient,
    other:
      role === 'PROFESSIONAL'
        ? {
            kind: 'CLIENT' as const,
            id: c.client.id,
            name: c.client.name,
            avatarUrl: c.client.avatarUrl,
            href: null as string | null,
          }
        : {
            kind: 'PROFESSIONAL' as const,
            id: c.professional.user.id,
            name: c.professional.user.name,
            avatarUrl: c.professional.user.avatarUrl,
            href: c.professional.slug ? `/profissional/${c.professional.slug}` : null,
          },
  }));

  return NextResponse.json({ conversations: items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = startConversationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { professionalId, body: messageBody, bookingId } = parsed.data;

  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: { user: { select: { id: true } } },
  });
  if (!professional) {
    return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
  }

  if (professional.userId === session.user.id) {
    return NextResponse.json({ error: 'Você não pode iniciar conversa consigo mesmo' }, { status: 400 });
  }

  const conversation = await prisma.conversation.upsert({
    where: { clientId_professionalId: { clientId: session.user.id, professionalId } },
    update: {},
    create: {
      clientId: session.user.id,
      professionalId,
      bookingId: bookingId ?? null,
    },
  });

  const now = new Date();
  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        body: messageBody,
      },
    }),
    prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: now,
        lastMessage: messageBody.slice(0, 240),
        unreadByProfessional: { increment: 1 },
      },
    }),
  ]);

  void notify({
    userId: professional.userId,
    type: 'MESSAGE_RECEIVED',
    title: `Nova mensagem de ${session.user.name ?? 'cliente'}`,
    body: messageBody.slice(0, 160),
    metadata: { conversationId: conversation.id },
  });

  return NextResponse.json({ conversationId: conversation.id });
}
