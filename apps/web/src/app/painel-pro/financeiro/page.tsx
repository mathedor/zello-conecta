import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Banknote, FileText, History, Wallet } from 'lucide-react';
import { prisma, type WithdrawStatus } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBRL } from '@/lib/pricing';
import { PayoutAccountForm } from './payout-account-form';
import { WithdrawForm } from './withdraw-form';

export const metadata = { title: 'Financeiro' };

const STATUS_LABEL: Record<WithdrawStatus, { label: string; tone: 'soft' | 'success' | 'outline' | 'default' }> = {
  REQUESTED: { label: 'Solicitado', tone: 'soft' },
  PROCESSING: { label: 'Processando', tone: 'soft' },
  PAID: { label: 'Pago', tone: 'success' },
  REJECTED: { label: 'Rejeitado', tone: 'outline' },
};

export default async function FinanceiroPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar?next=/painel-pro/financeiro');

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) redirect('/painel-pro');

  const [account, completed, tickets] = await Promise.all([
    prisma.payoutAccount.findUnique({ where: { professionalId: professional.id } }),
    prisma.booking.findMany({
      where: { professionalId: professional.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 30,
      include: {
        service: { select: { title: true } },
        client: { select: { name: true } },
      },
    }),
    prisma.withdrawTicket.findMany({
      where: { professionalId: professional.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const balanceAvailable = Number(professional.balanceAvailable);
  const balancePending = Number(professional.balancePending);
  const totalEarned = Number(professional.totalEarned);

  return (
    <DashboardShell
      title="Financeiro"
      description="Acompanhe seu saldo, solicite saques e veja o histórico financeiro."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-zello-200 bg-gradient-to-br from-zello-50 to-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-zello-700">
              <Wallet className="h-4 w-4" />
              <span className="font-medium">Saldo disponível</span>
            </div>
            <div className="mt-2 text-3xl font-bold text-zello-700">{formatBRL(balanceAvailable)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Pode ser sacado a qualquer momento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <History className="h-4 w-4" />
              <span className="font-medium">Em retenção</span>
            </div>
            <div className="mt-2 text-3xl font-bold">{formatBRL(balancePending)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Liberação em até 48h após o término</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Banknote className="h-4 w-4" />
              <span className="font-medium">Total ganho</span>
            </div>
            <div className="mt-2 text-3xl font-bold">{formatBRL(totalEarned)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Histórico desde o cadastro</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg font-semibold">Dados para receber (PIX)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre uma chave PIX para receber seus saques. Saque mínimo: R$ 20,00.
            </p>
            <div className="mt-6">
              <PayoutAccountForm
                initial={
                  account
                    ? {
                        pixKey: account.pixKey ?? '',
                        pixKeyType: (account.pixKeyType as 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM') ?? 'CPF',
                        bankName: account.bankName ?? '',
                        bankCode: account.bankCode ?? '',
                        agency: account.agency ?? '',
                        account: account.account ?? '',
                        accountType: (account.accountType as 'CC' | 'CP' | undefined) ?? '',
                        holderName: account.holderName ?? '',
                        holderDoc: account.holderDoc ?? '',
                      }
                    : undefined
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg font-semibold">Solicitar saque</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Saldo disponível: <strong>{formatBRL(balanceAvailable)}</strong>
            </p>
            <div className="mt-6">
              <WithdrawForm available={balanceAvailable} hasPayoutAccount={!!account} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg font-semibold">Histórico de saques</h2>
            {tickets.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Nenhum saque solicitado ainda.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {tickets.map((t) => {
                  const s = STATUS_LABEL[t.status];
                  return (
                    <li
                      key={t.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{formatBRL(Number(t.amount))}</span>
                          <Badge variant={s.tone}>{s.label}</Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {t.createdAt.toLocaleDateString('pt-BR')} ·{' '}
                          {t.pixKeyType ?? '—'} {t.pixKey ?? ''}
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-lg font-semibold">Histórico de serviços concluídos</h2>
            {completed.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Nenhum serviço concluído ainda.</p>
            ) : (
              <ul className="mt-5 space-y-2">
                {completed.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{b.service.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.client.name} ·{' '}
                        {b.completedAt?.toLocaleDateString('pt-BR') ?? '—'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <div className="font-semibold text-zello-600">
                        +{formatBRL(Number(b.netToProvider))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        bruto {formatBRL(Number(b.totalAmount))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
