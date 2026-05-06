import { prisma } from '@zello/db';
import { buildICalendar } from '@/lib/ical';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return new Response('Token obrigatório', { status: 400 });
  }

  const pro = await prisma.professional.findUnique({
    where: { id: token },
    include: { user: { select: { name: true } } },
  });
  if (!pro) {
    return new Response('Token inválido', { status: 404 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      professionalId: pro.id,
      status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
      scheduledAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { scheduledAt: 'asc' },
    include: {
      service: { select: { title: true } },
      client: { select: { name: true, phone: true } },
      serviceAddress: true,
    },
    take: 500,
  });

  const ics = buildICalendar({
    calName: `Zello Conecta — ${pro.user.name}`,
    events: bookings.map((b) => ({
      uid: b.id,
      start: b.scheduledAt,
      end: b.scheduledEnd,
      summary: `${b.service.title} — ${b.client.name}`,
      description: [
        `Cliente: ${b.client.name}`,
        b.client.phone ? `Telefone: ${b.client.phone}` : null,
        `Status: ${b.status}`,
        b.notesFromClient ? `Observações: ${b.notesFromClient}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      location: b.serviceAddress
        ? `${b.serviceAddress.street}, ${b.serviceAddress.number ?? 'S/N'} — ${b.serviceAddress.city}/${b.serviceAddress.state}`
        : undefined,
    })),
  });

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="zello-agenda.ics"',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
