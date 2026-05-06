import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileCheck,
  ListPlus,
  Wallet,
} from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Painel profissional' };

const kycCopy: Record<string, { label: string; tone: 'pending' | 'submitted' | 'approved' | 'rejected'; description: string; cta: string; ctaHref: string }> = {
  PENDING: {
    label: 'Documentação pendente',
    tone: 'pending',
    description: 'Envie seus documentos para começar a aparecer nas buscas e receber clientes.',
    cta: 'Enviar documentos',
    ctaHref: '/painel-pro/kyc',
  },
  SUBMITTED: {
    label: 'Em análise',
    tone: 'submitted',
    description: 'Sua documentação foi enviada. Análise em até 24 horas úteis.',
    cta: 'Ver documentos enviados',
    ctaHref: '/painel-pro/kyc',
  },
  APPROVED: {
    label: 'Verificado',
    tone: 'approved',
    description: 'Tudo certo! Você pode cadastrar serviços e configurar sua agenda.',
    cta: 'Cadastrar serviço',
    ctaHref: '/painel-pro/servicos/novo',
  },
  REJECTED: {
    label: 'Reenvio necessário',
    tone: 'rejected',
    description: 'Algum documento precisa ser reenviado. Confira o motivo.',
    cta: 'Corrigir documentos',
    ctaHref: '/painel-pro/kyc',
  },
};

export default async function PainelProPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar');

  const firstName = session.user.name?.split(' ')[0] ?? 'profissional';
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { professional: true },
  });

  if (!user) redirect('/entrar');

  const kyc = kycCopy[user.kycStatus] ?? kycCopy.PENDING!;

  return (
    <DashboardShell
      title={`Bem-vindo, ${firstName}`}
      description="Acompanhe sua agenda, ganhos e desempenho."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/painel-pro/perfil">Editar perfil</Link>
        </Button>
      }
    >
      <Card
        className={
          kyc.tone === 'approved'
            ? 'border-emerald-200 bg-emerald-50/40'
            : kyc.tone === 'rejected'
              ? 'border-destructive/30 bg-destructive/5'
              : 'border-zello-200 bg-zello-50/40'
        }
      >
        <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <div
              className={
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ' +
                (kyc.tone === 'approved'
                  ? 'bg-emerald-100 text-emerald-700'
                  : kyc.tone === 'rejected'
                    ? 'bg-destructive/15 text-destructive'
                    : 'bg-zello-100 text-zello-700')
              }
            >
              {kyc.tone === 'approved' ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : kyc.tone === 'rejected' ? (
                <AlertCircle className="h-6 w-6" />
              ) : kyc.tone === 'submitted' ? (
                <Clock className="h-6 w-6" />
              ) : (
                <FileCheck className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{kyc.label}</h2>
                <Badge
                  variant={
                    kyc.tone === 'approved'
                      ? 'success'
                      : kyc.tone === 'rejected'
                        ? 'outline'
                        : 'soft'
                  }
                >
                  {user.kycStatus}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{kyc.description}</p>
            </div>
          </div>
          <Button asChild>
            <Link href={kyc.ctaHref}>
              {kyc.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ClipboardList, label: 'Reservas pendentes', value: '0' },
          { icon: CalendarRange, label: 'Próximas atendidas', value: '0' },
          { icon: Wallet, label: 'Saldo disponível', value: 'R$ 0,00' },
          { icon: Wallet, label: 'Em retenção', value: 'R$ 0,00' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <s.icon className="h-5 w-5 text-zello-600" />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              <div className="mt-3 text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <ListPlus className="h-7 w-7 text-zello-600" />
            <h3 className="text-lg font-semibold">Cadastre seus serviços</h3>
            <p className="text-sm text-muted-foreground">
              Crie quantos serviços quiser, com fotos, preço por hora ou empreitada e duração.
            </p>
            <Button asChild variant="outline" className="mt-2 w-fit">
              <Link href="/painel-pro/servicos">
                Gerenciar serviços
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <CalendarRange className="h-7 w-7 text-zello-600" />
            <h3 className="text-lg font-semibold">Configure sua agenda</h3>
            <p className="text-sm text-muted-foreground">
              Defina os dias e horários disponíveis. Você pode bloquear horários a qualquer momento.
            </p>
            <Button asChild variant="outline" className="mt-2 w-fit">
              <Link href="/painel-pro/agenda">
                Abrir agenda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
