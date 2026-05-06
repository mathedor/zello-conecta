import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { sendMessageSchema } from '@/lib/messaging';
import { notify } from '@/lib/notify';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      professional: { include: { user: { select: { id: true, name: true } } } },
    },
  });
  if (!conv) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const isClient = conv.clientId === session.user.id;
  const isProfessional = conv.professional.userId === session.user.id;
  if (!isClient && !isProfessional) {
    return NextResponse.json({ error: 'Sem acesso' }, { status: 403 });
  }

  const recipientUserId = isClient ? conv.professional.userId : conv.clientId;
  const senderName = isClient ? conv.client.name : conv.professional.user.name;
  const messageBody = parsed.data.body;
  const now = new Date();

  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        body: messageBody,
      },
    });
    await tx.conversation.update({
      where: { id },
      data: {
        lastMessageAt: now,
        lastMessage: messageBody.slice(0, 240),
        ...(isClient
          ? { unreadByProfessional: { increment: 1 } }
          : { unreadByClient: { increment: 1 } }),
      },
    });
    return msg;
  });

  void notify({
    userId: recipientUserId,
    type: 'MESSAGE_RECEIVED',
    title: `Nova mensagem de ${senderName}`,
    body: messageBody.slice(0, 160),
    metadata: { conversationId: id },
  });

  return NextResponse.json({
    message: {
      id: message.id,
      senderId: message.senderId,
      body: message.body,
      readAt: null,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
