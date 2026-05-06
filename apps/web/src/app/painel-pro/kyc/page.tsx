import { redirect } from 'next/navigation';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { KycForm } from './kyc-form';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, FileCheck } from 'lucide-react';

export const metadata = { title: 'Verificação de identidade (KYC)' };

export default async function KycPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      documents: {
        where: { status: { in: ['SUBMITTED', 'APPROVED', 'REJECTED'] } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) redirect('/entrar');

  const status = user.kycStatus;

  return (
    <DashboardShell
      title="Verificação de identidade (KYC)"
      description="Para aparecer nas buscas e receber clientes, precisamos validar sua identidade. Aprovação em até 24h úteis."
    >
      <div className="mx-auto max-w-3xl">
        {status === 'SUBMITTED' ? (
          <Card className="mb-6 border-zello-200 bg-zello-50/40">
            <CardContent className="flex items-start gap-4 p-6">
              <Clock className="h-6 w-6 shrink-0 text-zello-600" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">Documentos em análise</h2>
                  <Badge variant="soft">Em análise</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recebemos seus documentos em{' '}
                  {user.kycSubmittedAt?.toLocaleDateString('pt-BR') ?? 'recentemente'}. Análise em
                  até 24h úteis.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {status === 'APPROVED' ? (
          <Card className="mb-6 border-emerald-200 bg-emerald-50/40">
            <CardContent className="flex items-start gap-4 p-6">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-700" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">Tudo certo!</h2>
                  <Badge variant="success">Aprovado</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seu KYC foi aprovado em{' '}
                  {user.kycReviewedAt?.toLocaleDateString('pt-BR') ?? 'recentemente'}. Seu perfil já
                  está visível nas buscas.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {status === 'REJECTED' && user.kycRejectReason ? (
          <Card className="mb-6 border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-start gap-4 p-6">
              <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">Reenvio necessário</h2>
                  <Badge variant="outline">Rejeitado</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{user.kycRejectReason}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {status !== 'APPROVED' ? (
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="mb-6 flex items-start gap-3">
                <FileCheck className="mt-1 h-5 w-5 shrink-0 text-zello-600" />
                <div>
                  <h3 className="font-semibold">O que enviar</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    <li>• Frente do RG ou CNH</li>
                    <li>• Verso do RG ou CNH</li>
                    <li>• Selfie segurando o documento</li>
                    <li>• Comprovante de endereço (opcional, só se solicitado depois)</li>
                  </ul>
                </div>
              </div>
              <KycForm />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardShell>
  );
}
