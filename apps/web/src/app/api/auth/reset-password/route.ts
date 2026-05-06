import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@zello/db';
import { resetSchema } from '@/lib/auth-schemas';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return NextResponse.json(
      { error: 'Link expirado ou inválido. Solicite uma nova redefinição.' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email: record.identifier } });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ ok: true });
}
