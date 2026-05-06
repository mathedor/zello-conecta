import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  const { id } = await params;

  const bookings = await prisma.booking.findMany({
    where: { serviceId: id, status: { not: 'PENDING_PAYMENT' } },
    orderBy: { scheduledAt: 'desc' },
    include: {
      client: { select: { id: true, name: true, phone: true, email: true } },
      serviceAddress: true,
      payment: { select: { method: true, status: true } },
    },
    take: 100,
  });

  const serialized = bookings.map((b) => ({
    id: b.id,
    reference: b.reference,
    status: b.status,
    scheduledAt: b.scheduledAt.toISOString(),
    durationMin: b.durationMin,
    locationMode: b.locationMode,
    totalAmount: Number(b.totalAmount),
    netToProvider: Number(b.netToProvider),
    paymentMethod: b.payment?.method ?? null,
    paymentStatus: b.payment?.status ?? null,
    client: b.client,
    address: b.serviceAddress
      ? `${b.serviceAddress.street}, ${b.serviceAddress.number ?? 'S/N'} — ${b.serviceAddress.city}/${b.serviceAddress.state}`
      : null,
  }));

  return NextResponse.json({ bookings: serialized });
}
