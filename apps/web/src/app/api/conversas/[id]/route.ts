import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadConversationForUser(conversationId: string, userId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      professional: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });
  if (!conv) return null;
  if (conv.clientId !== userId && conv.professional.userId !== userId) return null;
  return conv;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const { id } = await params;

  const conv = await loadConversationForUser(id, session.user.id);
  if (!conv) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  return NextResponse.json({
    conversation: {
      id: conv.id,
      client: conv.client,
      professional: {
        id: conv.professional.id,
        slug: conv.professional.slug,
        user: conv.professional.user,
      },
      bookingId: conv.bookingId,
    },
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      readAt: m.readAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const { id } = await params;

  const conv = await loadConversationForUser(id, session.user.id);
  if (!conv) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const isClient = conv.clientId === session.user.id;
  await prisma.$transaction([
    prisma.message.updateMany({
      where: {
        conversationId: id,
        readAt: null,
        NOT: { senderId: session.user.id },
      },
      data: { readAt: new Date() },
    }),
    prisma.conversation.update({
      where: { id },
      data: isClient ? { unreadByClient: 0 } : { unreadByProfessional: 0 },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
