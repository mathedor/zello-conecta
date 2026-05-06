import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Inbox, MessageCircle } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Mensagens' };
export const dynamic = 'force-dynamic';

export default async function MensagensListPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar?next=/mensagens');

  const userId = session.user.id;
  const role = session.user.role;
  const isPro = role === 'PROFESSIONAL';

  const conversations = await prisma.conversation.findMany({
    where: isPro ? { professional: { userId } } : { clientId: userId },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      client: { select: { name: true, avatarUrl: true } },
      professional: { select: { slug: true, user: { select: { name: true, avatarUrl: true } } } },
    },
    take: 100,
  });

  return (
    <DashboardShell title="Mensagens" description="Suas conversas com clientes e profissionais.">
      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Inbox className="h-10 w-10 text-zello-600" />
            <h2 className="text-lg font-semibold">Nenhuma conversa ainda</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Quando alguém iniciar uma conversa, ela aparece aqui. Você pode começar enviando uma
              mensagem direto no perfil do profissional.
            </p>
            <Link
              href="/buscar"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-zello-600 hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              Buscar profissionais
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {conversations.map((c) => {
                const other = isPro
                  ? { name: c.client.name, avatarUrl: c.client.avatarUrl }
                  : {
                      name: c.professional.user.name,
                      avatarUrl: c.professional.user.avatarUrl,
                    };
                const initials = other.name
                  .split(' ')
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                const unread = isPro ? c.unreadByProfessional : c.unreadByClient;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/mensagens/${c.id}`}
                      className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary/40 sm:p-5"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zello-600">
                        {other.avatarUrl ? (
                          <Image
                            src={other.avatarUrl}
                            alt={other.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                            {initials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className={'truncate text-sm font-semibold' + (unread ? '' : '')}>
                            {other.name}
                          </p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {c.lastMessageAt.toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p
                          className={
                            'mt-0.5 line-clamp-1 text-sm ' +
                            (unread ? 'font-medium text-foreground' : 'text-muted-foreground')
                          }
                        >
                          {c.lastMessage ?? 'Conversa iniciada'}
                        </p>
                      </div>
                      {unread ? (
                        <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zello-600 px-1.5 text-[11px] font-bold text-white">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
