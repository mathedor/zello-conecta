import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { createBookingSchema } from '@/lib/booking-schemas';
import { combineDateAndTime, getServiceAvailability } from '@/lib/availability';
import { bookingPricing } from '@/lib/pricing';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Faça login para agendar' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { serviceId, date, time, notes } = parsed.data;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { professional: { include: { user: { select: { id: true } } } } },
  });

  if (!service || !service.active || !service.professional) {
    return NextResponse.json({ error: 'Serviço indisponível' }, { status: 404 });
  }

  if (service.professional.user.id === session.user.id) {
    return NextResponse.json(
      { error: 'Você não pode agendar com você mesmo' },
      { status: 400 },
    );
  }

  const scheduledAt = combineDateAndTime(date, time);
  const scheduledEnd = new Date(scheduledAt.getTime() + service.durationMin * 60_000);

  if (scheduledAt < new Date()) {
    return NextResponse.json({ error: 'Horário no passado' }, { status: 400 });
  }

  const dayStart = new Date(scheduledAt);
  dayStart.setHours(0, 0, 0, 0);
  const availability = await getServiceAvailability({
    serviceId,
    startDate: dayStart,
    days: 1,
  });
  const dayInfo = availability[0];
  if (!dayInfo || !dayInfo.slots.includes(time)) {
    return NextResponse.json(
      { error: 'Horário não está mais disponível. Escolha outro.' },
      { status: 409 },
    );
  }

  const breakdown = bookingPricing({ servicePrice: Number(service.price) });

  const booking = await prisma.booking.create({
    data: {
      clientId: session.user.id,
      professionalId: service.professional.id,
      serviceId: service.id,
      scheduledAt,
      scheduledEnd,
      durationMin: service.durationMin,
      locationMode: service.locationMode === 'BOTH' ? 'PROFESSIONAL_LOCATION' : service.locationMode,
      servicePrice: breakdown.servicePrice,
      travelFee: breakdown.travelFee,
      platformFee: breakdown.platformFee,
      totalAmount: breakdown.totalAmount,
      netToProvider: breakdown.netToProvider,
      status: 'PENDING_PAYMENT',
      notesFromClient: notes ?? null,
    },
    select: { id: true },
  });

  return NextResponse.json({ bookingId: booking.id });
}
