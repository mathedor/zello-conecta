import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { adminNotifySchema } from '@/lib/admin-schemas';
import { notify } from '@/lib/notify';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = adminNotifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  await notify({
    userId: target.id,
    type: 'GENERIC',
    title: parsed.data.title,
    body: parsed.data.body,
    metadata: { fromAdmin: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
