import { redirect } from 'next/navigation';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { ScheduleEditor } from './schedule-editor';
import { BlocksManager } from './blocks-manager';
import { IntegrationsCard } from './integrations-card';
import { isGoogleConfigured } from '@/lib/google-calendar';
import { env } from '@/lib/env';

export const metadata = { title: 'Agenda' };

interface PageProps {
  searchParams: Promise<{ google?: string }>;
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect('/entrar');
  const sp = await searchParams;

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) redirect('/painel-pro');

  const [slots, blocks, googleIntegration] = await Promise.all([
    prisma.schedule.findMany({
      where: { professionalId: professional.id, active: true },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.scheduleBlock.findMany({
      where: { professionalId: professional.id, endsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
    }),
    prisma.calendarIntegration.findUnique({
      where: { userId_provider: { userId: session.user.id, provider: 'GOOGLE' } },
    }),
  ]);

  return (
    <DashboardShell
      title="Agenda"
      description="Configure seus horários disponíveis, bloqueie momentos pontuais e sincronize com seu calendário."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-lg font-semibold">Horários semanais recorrentes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Os clientes só podem agendar dentro destes horários. Use múltiplas faixas por dia
                (ex: 08:00–12:00 e 14:00–18:00).
              </p>
              <div className="mt-6">
                <ScheduleEditor
                  initialSlots={slots.map((s) => ({
                    weekday: s.weekday,
                    startTime: s.startTime,
                    endTime: s.endTime,
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-lg font-semibold">Bloqueios pontuais</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Compromissos fora da plataforma, viagens ou férias.
              </p>
              <div className="mt-6">
                <BlocksManager
                  initial={blocks.map((b) => ({
                    id: b.id,
                    startsAt: b.startsAt.toISOString(),
                    endsAt: b.endsAt.toISOString(),
                    reason: b.reason,
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-lg font-semibold">Integrações de calendário</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Receba reservas direto no seu calendário pessoal.
              </p>
              <div className="mt-6">
                <IntegrationsCard
                  professionalId={professional.id}
                  appUrl={env.APP_URL}
                  googleConnected={Boolean(googleIntegration?.active)}
                  googleConfigured={isGoogleConfigured()}
                  status={sp.google}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
