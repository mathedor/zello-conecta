import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { withdrawSchema, MIN_WITHDRAW } from '@/lib/finance-schemas';
import { requireProfessional } from '@/lib/professional-guard';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = withdrawSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
  }

  const account = await prisma.payoutAccount.findUnique({
    where: { professionalId: guard.professional.id },
  });
  if (!account) {
    return NextResponse.json(
      { error: 'Cadastre seus dados de saque primeiro' },
      { status: 400 },
    );
  }

  const amount = parsed.data.amount;

  if (amount < MIN_WITHDRAW) {
    return NextResponse.json(
      { error: `Valor mínimo: R$ ${MIN_WITHDRAW.toFixed(2)}` },
      { status: 400 },
    );
  }

  const fresh = await prisma.professional.findUnique({
    where: { id: guard.professional.id },
    select: { balanceAvailable: true },
  });
  const available = Number(fresh?.balanceAvailable ?? 0);
  if (amount > available) {
    return NextResponse.json(
      { error: `Saldo insuficiente. Disponível: R$ ${available.toFixed(2)}` },
      { status: 400 },
    );
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const created = await tx.withdrawTicket.create({
      data: {
        professionalId: guard.professional.id,
        amount,
        status: 'REQUESTED',
        pixKey: account.pixKey,
        pixKeyType: account.pixKeyType,
        bankSnapshot: {
          bankName: account.bankName,
          bankCode: account.bankCode,
          agency: account.agency,
          account: account.account,
          accountType: account.accountType,
          holderName: account.holderName,
          holderDoc: account.holderDoc,
        },
      },
    });
    await tx.professional.update({
      where: { id: guard.professional.id },
      data: { balanceAvailable: { decrement: amount } },
    });
    return created;
  });

  return NextResponse.json({ ticket });
}
