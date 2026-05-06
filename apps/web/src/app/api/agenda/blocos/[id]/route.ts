import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { requireProfessional } from '@/lib/professional-guard';

export const runtime = 'nodejs';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const block = await prisma.scheduleBlock.findUnique({ where: { id } });
  if (!block || block.professionalId !== guard.professional.id) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }

  await prisma.scheduleBlock.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
