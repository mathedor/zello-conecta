import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell, BellOff } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { MarkAllReadButton } from './mark-all-read-button';

export const metadata = { title: 'Notificações' };

export default async function NotificacoesPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar?next=/painel/notificacoes');

  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const unreadCount = items.filter((it) => !it.readAt).length;

  return (
    <DashboardShell
      title="Notificações"
      description="Histórico das suas notificações na Zello Conecta."
      actions={unreadCount > 0 ? <MarkAllReadButton /> : null}
    >
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <BellOff className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Você ainda não tem notificações</h2>
            <p className="text-sm text-muted-foreground">
              Vai aparecer aqui quando algo importante acontecer.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <Card key={it.id} className={!it.readAt ? 'border-zello-200 bg-zello-50/50' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Bell
                    className={
                      'mt-0.5 h-4 w-4 shrink-0 ' + (!it.readAt ? 'text-zello-600' : 'text-muted-foreground')
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className={'text-sm ' + (!it.readAt ? 'font-semibold' : '')}>{it.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {it.createdAt.toLocaleString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {it.bookingId ? (
                    <Link
                      href={`/painel/agendamentos`}
                      className="text-xs font-medium text-zello-600 hover:underline"
                    >
                      Ver
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
