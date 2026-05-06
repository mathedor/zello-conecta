import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@zello/db';
import { signupClientSchema } from '@/lib/auth-schemas';
import { sendEmail, welcomeEmail } from '@/lib/mailer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = signupClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'Já existe uma conta com este email.' },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone: phone || null,
      role: 'CLIENT',
      kycStatus: 'PENDING',
    },
    select: { id: true, name: true, email: true },
  });

  void sendEmail({
    to: user.email,
    subject: 'Bem-vindo à Zello Conecta',
    html: welcomeEmail(user.name),
  });

  return NextResponse.json({ ok: true, user });
}
