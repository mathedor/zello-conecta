import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  await prisma.calendarIntegration.deleteMany({
    where: { userId: session.user.id, provider: 'GOOGLE' },
  });

  return NextResponse.json({ ok: true });
}
