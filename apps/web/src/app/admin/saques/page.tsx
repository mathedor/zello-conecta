import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, FileText, Wallet } from 'lucide-react';
import { prisma, type WithdrawStatus } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBRL } from '@/lib/pricing';
import { WithdrawActions } from './withdraw-actions';

export const metadata = { title: 'Saques' };

const STATUS_LABEL: Record<WithdrawStatus, { label: string; tone: 'soft' | 'success' | 'outline' | 'default' }> = {
  REQUESTED: { label: 'Solicitado', tone: 'soft' },
  PROCESSING: { label: 'Processando', tone: 'soft' },
  PAID: { label: 'Pago', tone: 'success' },
  REJECTED: { label: 'Rejeitado', tone: 'outline' },
};

export default async function AdminSaquesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  const [pending, history] = await Promise.all([
    prisma.withdrawTicket.findMany({
      where: { status: { in: ['REQUESTED', 'PROCESSING'] } },
      include: {
        professional: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.withdrawTicket.findMany({
      where: { status: { in: ['PAID', 'REJECTED'] } },
      include: {
        professional: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { processedAt: 'desc' },
      take: 30,
    }),
  ]);

  return (
    <DashboardShell
      title="Tickets de saque"
      description={`${pending.length} ticket(s) pendente(s) de processamento.`}
    >
      {pending.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <h2 className="text-lg font-semibold">Nenhum saque pendente</h2>
            <p className="text-sm text-muted-foreground">Tudo em dia.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.map((t) => {
            const bank = (t.bankSnapshot as { bankName?: string; agency?: string; account?: string } | null) ?? null;
            return (
              <Card key={t.id}>
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="soft">REQUESTED</Badge>
                        <code className="text-xs text-muted-foreground">{t.id}</code>
                      </div>
                      <h2 className="mt-1 text-lg font-semibold">{t.professional.user.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {t.professional.user.email}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Solicitado em {t.createdAt.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-zello-600">
                        {formatBRL(Number(t.amount))}
                      </div>
                      <div className="text-xs text-muted-foreground">via PIX</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Chave PIX ({t.pixKeyType ?? '—'})
                      </div>
                      <div className="mt-0.5 break-all font-mono">{t.pixKey ?? '—'}</div>
                    </div>
                    {bank ? (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Conta bancária (backup)
                        </div>
                        <div className="mt-0.5">
                          {bank.bankName ?? '—'} · Ag {bank.agency ?? '—'} · Cc {bank.account ?? '—'}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <WithdrawActions ticketId={t.id} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Histórico recente</h2>
        {history.length === 0 ? (
          <Card>
            <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <Wallet className="h-5 w-5" />
              Sem saques processados ainda.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {history.map((t) => {
                  const s = STATUS_LABEL[t.status];
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={s.tone}>{s.label}</Badge>
                          <span className="font-semibold">{t.professional.user.name}</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {t.processedAt?.toLocaleString('pt-BR') ?? '—'} · {formatBRL(Number(t.amount))}
                        </div>
                        {t.rejectReason ? (
                          <p className="mt-1 text-xs text-destructive">{t.rejectReason}</p>
                        ) : null}
                      </div>
                      {t.receiptUrl ? (
                        <Link
                          href={t.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-zello-600 hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          Comprovante
                        </Link>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
