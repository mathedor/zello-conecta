import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { prisma } from '@zello/db';
import { forgotSchema } from '@/lib/auth-schemas';
import { sendEmail, resetPasswordEmail } from '@/lib/mailer';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.status === 'ACTIVE') {
    const token = nanoid(40);
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const link = `${env.APP_URL}/redefinir-senha?token=${encodeURIComponent(token)}`;

    void sendEmail({
      to: user.email,
      subject: 'Redefinição de senha — Zello Conecta',
      html: resetPasswordEmail(user.name, link),
    });
  }

  return NextResponse.json({ ok: true });
}
