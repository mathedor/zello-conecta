import { redirect } from 'next/navigation';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { ScheduleEditor } from './schedule-editor';
import { BlocksManager } from './blocks-manager';

export const metadata = { title: 'Agenda' };

export default async function AgendaPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar');

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) redirect('/painel-pro');

  const [slots, blocks] = await Promise.all([
    prisma.schedule.findMany({
      where: { professionalId: professional.id, active: true },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.scheduleBlock.findMany({
      where: { professionalId: professional.id, endsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
    }),
  ]);

  return (
    <DashboardShell
      title="Agenda"
      description="Configure seus horários disponíveis e bloqueie momentos pontuais."
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

        <div>
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-lg font-semibold">Bloqueios pontuais</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Compromissos fora da plataforma, viagens ou férias. Os horários ficam indisponíveis
                para reserva.
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
        </div>
      </div>
    </DashboardShell>
  );
}
