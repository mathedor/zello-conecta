import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

const updateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  description: z.string().max(200).optional().or(z.literal('')),
  iconName: z.string().max(60).optional().or(z.literal('')),
  approved: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.iconName !== undefined ? { iconName: data.iconName || null } : {}),
      ...(data.approved !== undefined ? { approved: data.approved } : {}),
    },
  });

  return NextResponse.json({ category: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  const { id } = await params;

  const count = await prisma.service.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Não é possível excluir: ${count} serviço(s) usam esta categoria.` },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
