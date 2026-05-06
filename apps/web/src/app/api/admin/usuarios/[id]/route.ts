import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { adminUserUpdateSchema } from '@/lib/admin-schemas';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const target = await prisma.user.findUnique({
    where: { id },
    include: { professional: { select: { id: true } } },
  });
  if (!target) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const userPatch: Record<string, unknown> = {};
  if (data.name !== undefined) userPatch.name = data.name;
  if (data.email !== undefined) userPatch.email = data.email;
  if (data.phone !== undefined) userPatch.phone = data.phone || null;
  if (data.role !== undefined) userPatch.role = data.role;
  if (data.status !== undefined) userPatch.status = data.status;
  if (data.kycStatus !== undefined) {
    userPatch.kycStatus = data.kycStatus;
    if (data.kycStatus === 'APPROVED') userPatch.kycReviewedAt = new Date();
  }

  const proPatch: Record<string, unknown> = {};
  if (data.city !== undefined) proPatch.city = data.city || null;
  if (data.state !== undefined) proPatch.state = (data.state || '').toUpperCase() || null;
  if (data.headline !== undefined) proPatch.headline = data.headline || null;
  if (data.bio !== undefined) proPatch.bio = data.bio || null;

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userPatch).length > 0) {
      await tx.user.update({ where: { id }, data: userPatch });
    }
    if (Object.keys(proPatch).length > 0 && target.professional) {
      await tx.professional.update({
        where: { id: target.professional.id },
        data: proPatch,
      });
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: 'Você não pode excluir sua própria conta de admin pelo painel.' },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  await prisma.user.update({
    where: { id },
    data: { status: 'DELETED', email: `deleted+${id}@zello.invalid` },
  });

  return NextResponse.json({ ok: true });
}
