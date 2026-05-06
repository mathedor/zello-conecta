import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@zello/db';
import { signupProSchema } from '@/lib/auth-schemas';
import { sendEmail, welcomeProEmail } from '@/lib/mailer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = signupProSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, password, phone, cpf, headline, bio } = parsed.data;

  const cpfClean = cpf.replace(/\D/g, '');

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json(
      { error: 'Já existe uma conta com este email.' },
      { status: 409 },
    );
  }
  const existingCpf = await prisma.user.findUnique({ where: { cpf: cpfClean } });
  if (existingCpf) {
    return NextResponse.json({ error: 'Este CPF já está cadastrado.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      cpf: cpfClean,
      role: 'PROFESSIONAL',
      kycStatus: 'PENDING',
      professional: {
        create: {
          headline,
          bio: bio || null,
        },
      },
    },
    select: { id: true, name: true, email: true },
  });

  void sendEmail({
    to: user.email,
    subject: 'Sua conta de profissional foi criada',
    html: welcomeProEmail(user.name),
  });

  return NextResponse.json({ ok: true, user });
}
