import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from './auth';

export async function requireProfessional() {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, response: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  }
  if (session.user.role !== 'PROFESSIONAL' && session.user.role !== 'ADMIN') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Apenas profissionais' }, { status: 403 }),
    };
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });

  if (!professional) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Perfil profissional não encontrado' },
        { status: 404 },
      ),
    };
  }

  return { ok: true as const, session, professional };
}
