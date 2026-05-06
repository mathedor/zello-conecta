import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { payoutAccountSchema } from '@/lib/finance-schemas';
import { requireProfessional } from '@/lib/professional-guard';

export const runtime = 'nodejs';

export async function GET() {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;

  const account = await prisma.payoutAccount.findUnique({
    where: { professionalId: guard.professional.id },
  });
  return NextResponse.json({ account });
}

export async function PUT(req: Request) {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = payoutAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const account = await prisma.payoutAccount.upsert({
    where: { professionalId: guard.professional.id },
    create: {
      professionalId: guard.professional.id,
      pixKey: data.pixKey,
      pixKeyType: data.pixKeyType,
      bankName: data.bankName || null,
      bankCode: data.bankCode || null,
      agency: data.agency || null,
      account: data.account || null,
      accountType: data.accountType || null,
      holderName: data.holderName,
      holderDoc: data.holderDoc || null,
    },
    update: {
      pixKey: data.pixKey,
      pixKeyType: data.pixKeyType,
      bankName: data.bankName || null,
      bankCode: data.bankCode || null,
      agency: data.agency || null,
      account: data.account || null,
      accountType: data.accountType || null,
      holderName: data.holderName,
      holderDoc: data.holderDoc || null,
    },
  });

  return NextResponse.json({ account });
}
