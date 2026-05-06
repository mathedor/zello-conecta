import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { ChatThread } from './chat-thread';

export const metadata = { title: 'Conversa' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversaPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/entrar?next=/mensagens/${id}`);

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      professional: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      booking: { select: { id: true, reference: true, scheduledAt: true } },
    },
  });
  if (!conv) notFound();

  const userId = session.user.id;
  const isClient = conv.clientId === userId;
  const isProfessional = conv.professional.userId === userId;
  if (!isClient && !isProfessional) redirect('/mensagens');

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  await prisma.$transaction([
    prisma.message.updateMany({
      where: { conversationId: id, readAt: null, NOT: { senderId: userId } },
      data: { readAt: new Date() },
    }),
    prisma.conversation.update({
      where: { id },
      data: isClient ? { unreadByClient: 0 } : { unreadByProfessional: 0 },
    }),
  ]);

  const other = isClient
    ? {
        name: conv.professional.user.name,
        avatarUrl: conv.professional.user.avatarUrl,
        href: conv.professional.slug ? `/profissional/${conv.professional.slug}` : null,
      }
    : { name: conv.client.name, avatarUrl: conv.client.avatarUrl, href: null };

  return (
    <main className="container py-6 md:py-10">
      <div className="mx-auto flex max-w-3xl flex-col">
        <Link
          href="/mensagens"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ChatThread
              conversationId={id}
              currentUserId={userId}
              other={{ name: other.name, avatarUrl: other.avatarUrl, href: other.href }}
              bookingRef={conv.booking?.reference ?? null}
              bookingDate={conv.booking?.scheduledAt?.toISOString() ?? null}
              initialMessages={messages.map((m) => ({
                id: m.id,
                senderId: m.senderId,
                body: m.body,
                readAt: m.readAt?.toISOString() ?? null,
                createdAt: m.createdAt.toISOString(),
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
