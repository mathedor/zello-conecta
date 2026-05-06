import { NextResponse } from 'next/server';
import { getServiceAvailability } from '@/lib/availability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceId = url.searchParams.get('serviceId');
  const startParam = url.searchParams.get('start');
  const days = Number(url.searchParams.get('days') ?? 14);

  if (!serviceId) {
    return NextResponse.json({ error: 'serviceId obrigatório' }, { status: 400 });
  }

  const start = startParam ? new Date(startParam) : new Date();
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
  }

  const availability = await getServiceAvailability({
    serviceId,
    startDate: start,
    days: Math.min(28, Math.max(1, days)),
  });

  return NextResponse.json({ availability });
}
