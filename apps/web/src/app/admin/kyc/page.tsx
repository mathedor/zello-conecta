import { redirect } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, FileText, XCircle } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KycReviewActions } from './kyc-review-actions';

export const metadata = { title: 'Revisão de KYC' };

export default async function AdminKycPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  const pending = await prisma.user.findMany({
    where: { kycStatus: 'SUBMITTED' },
    include: {
      documents: { where: { status: 'SUBMITTED' }, orderBy: { createdAt: 'asc' } },
      professional: true,
    },
    orderBy: { kycSubmittedAt: 'asc' },
  });

  return (
    <DashboardShell
      title="Revisão de KYC"
      description={`${pending.length} cadastro(s) aguardando análise.`}
    >
      {pending.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <h2 className="text-lg font-semibold">Tudo em dia</h2>
            <p className="text-sm text-muted-foreground">
              Não há documentação pendente de análise no momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {pending.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{user.name}</h2>
                      <Badge variant="soft">{user.role}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {user.email}
                      {user.cpf ? ` · CPF ${user.cpf}` : ''}
                    </p>
                    {user.professional?.headline ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {user.professional.headline}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Enviado em{' '}
                      {user.kycSubmittedAt?.toLocaleString('pt-BR') ?? 'data não registrada'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {user.documents.map((doc) => {
                    const isImage = /\.(png|jpe?g|webp)$/i.test(doc.url);
                    return (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-xl border border-border bg-secondary/30 p-3 transition-colors hover:border-zello-200"
                      >
                        <div className="text-xs font-medium text-muted-foreground">{doc.type}</div>
                        <div className="mt-2 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-card">
                          {isImage ? (
                            <Image
                              src={doc.url}
                              alt={doc.type}
                              width={400}
                              height={300}
                              className="h-full w-full object-contain"
                              unoptimized
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 p-6 text-muted-foreground">
                              <FileText className="h-8 w-8" />
                              <span className="text-xs">Abrir documento</span>
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>

                <KycReviewActions userId={user.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
