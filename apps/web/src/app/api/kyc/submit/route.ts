import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { kycSubmitSchema } from '@/lib/auth-schemas';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = kycSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const userId = session.user.id;

  await prisma.$transaction([
    prisma.kycDocument.deleteMany({ where: { userId, status: { in: ['PENDING', 'SUBMITTED'] } } }),
    prisma.kycDocument.createMany({
      data: parsed.data.documents.map((d) => ({
        userId,
        type: d.type,
        url: d.url,
        status: 'SUBMITTED' as const,
      })),
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'SUBMITTED',
        kycSubmittedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
