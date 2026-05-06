import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { scheduleReplaceSchema } from '@/lib/service-schemas';
import { requireProfessional } from '@/lib/professional-guard';

export const runtime = 'nodejs';

export async function GET() {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;

  const [slots, blocks] = await Promise.all([
    prisma.schedule.findMany({
      where: { professionalId: guard.professional.id, active: true },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.scheduleBlock.findMany({
      where: { professionalId: guard.professional.id, endsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
    }),
  ]);

  return NextResponse.json({ slots, blocks });
}

export async function PUT(req: Request) {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = scheduleReplaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.schedule.deleteMany({ where: { professionalId: guard.professional.id } }),
    prisma.schedule.createMany({
      data: parsed.data.slots.map((s) => ({
        professionalId: guard.professional.id,
        weekday: s.weekday,
        startTime: s.startTime,
        endTime: s.endTime,
        active: true,
      })),
    }),
  ]);

  const slots = await prisma.schedule.findMany({
    where: { professionalId: guard.professional.id, active: true },
    orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
  });

  return NextResponse.json({ slots });
}
