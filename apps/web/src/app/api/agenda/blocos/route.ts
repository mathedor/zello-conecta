import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { blockCreateSchema } from '@/lib/service-schemas';
import { requireProfessional } from '@/lib/professional-guard';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = blockCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const block = await prisma.scheduleBlock.create({
    data: {
      professionalId: guard.professional.id,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
      reason: parsed.data.reason || null,
    },
  });

  return NextResponse.json({ block });
}
