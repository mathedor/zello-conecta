import { prisma, type Weekday } from '@zello/db';

const WEEKDAY_BY_INDEX: Weekday[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export interface AvailabilityDay {
  date: string;
  weekday: Weekday;
  slots: string[];
}

interface RangeInMinutes {
  start: number;
  end: number;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function dateAtTime(day: Date, minutes: number): Date {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

function rangesOverlap(a: { start: Date; end: Date }, b: { start: Date; end: Date }): boolean {
  return a.start < b.end && b.start < a.end;
}

export async function getServiceAvailability({
  serviceId,
  startDate,
  days = 14,
  granularityMin = 30,
}: {
  serviceId: string;
  startDate: Date;
  days?: number;
  granularityMin?: number;
}): Promise<AvailabilityDay[]> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      professional: {
        include: {
          schedules: { where: { active: true } },
          scheduleBlocks: true,
        },
      },
    },
  });
  if (!service || !service.active || !service.professional) return [];

  const duration = service.durationMin;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + days);

  const bookings = await prisma.booking.findMany({
    where: {
      professionalId: service.professional.id,
      status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'DISPUTED'] },
      scheduledAt: { gte: start, lt: end },
    },
    select: { scheduledAt: true, scheduledEnd: true },
  });

  const blocks = service.professional.scheduleBlocks
    .filter((b) => b.endsAt >= start && b.startsAt < end)
    .map((b) => ({ start: b.startsAt, end: b.endsAt }));

  const result: AvailabilityDay[] = [];
  const now = new Date();

  for (let i = 0; i < days; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const weekday = WEEKDAY_BY_INDEX[day.getDay()];
    if (!weekday) continue;

    const daySchedules = service.professional.schedules.filter((s) => s.weekday === weekday);
    if (daySchedules.length === 0) {
      result.push({
        date: day.toISOString().slice(0, 10),
        weekday,
        slots: [],
      });
      continue;
    }

    const ranges: RangeInMinutes[] = daySchedules.map((s) => ({
      start: timeToMinutes(s.startTime),
      end: timeToMinutes(s.endTime),
    }));

    const slots: string[] = [];
    for (const range of ranges) {
      let cursor = range.start;
      while (cursor + duration <= range.end) {
        const slotStart = dateAtTime(day, cursor);
        const slotEnd = dateAtTime(day, cursor + duration);

        if (slotStart > now) {
          const conflictsBlock = blocks.some((b) => rangesOverlap({ start: slotStart, end: slotEnd }, b));
          const conflictsBooking = bookings.some((b) =>
            rangesOverlap(
              { start: slotStart, end: slotEnd },
              { start: b.scheduledAt, end: b.scheduledEnd },
            ),
          );
          if (!conflictsBlock && !conflictsBooking) {
            slots.push(minutesToTime(cursor));
          }
        }
        cursor += granularityMin;
      }
    }

    result.push({
      date: day.toISOString().slice(0, 10),
      weekday,
      slots,
    });
  }

  return result;
}

export function combineDateAndTime(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, mm] = time.split(':').map(Number);
  const dt = new Date(y!, (m ?? 1) - 1, d!, h ?? 0, mm ?? 0, 0, 0);
  return dt;
}
