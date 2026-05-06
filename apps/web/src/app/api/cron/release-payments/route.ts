import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AUTO_RELEASE_HOURS = Number(env.APP_NAME ? process.env.AUTO_RELEASE_HOURS ?? 48 : 48);

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - AUTO_RELEASE_HOURS * 60 * 60 * 1000);

  const candidates = await prisma.booking.findMany({
    where: {
      status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      scheduledEnd: { lte: cutoff },
      completedByClient: false,
      payment: {
        is: { status: 'PAID', escrowStatus: 'HELD' },
      },
      dispute: { is: null },
    },
    include: { payment: true },
    take: 200,
  });

  let released = 0;
  for (const b of candidates) {
    try {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: b.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            autoReleaseAt: new Date(),
            releasedAt: new Date(),
          },
        }),
        prisma.payment.update({
          where: { id: b.payment!.id },
          data: { escrowStatus: 'RELEASED' },
        }),
        prisma.professional.update({
          where: { id: b.professionalId },
          data: {
            balanceAvailable: { increment: b.netToProvider },
            totalCompleted: { increment: 1 },
            totalEarned: { increment: b.netToProvider },
          },
        }),
      ]);
      released += 1;
    } catch (err) {
      console.error('[cron release] erro em booking', b.id, err);
    }
  }

  return NextResponse.json({ ok: true, released, scanned: candidates.length });
}
