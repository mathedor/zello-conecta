import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { prisma } from '@zello/db';
import { signupProSchema } from '@/lib/auth-schemas';
import { slugify } from '@/lib/service-schemas';
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

  const { name, email, password, phone, cpf, headline, bio, city, state } = parsed.data;

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

  const baseSlug = slugify(name) || nanoid(8);
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.professional.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

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
          slug,
          headline,
          bio: bio || null,
          city,
          state: state.toUpperCase(),
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
