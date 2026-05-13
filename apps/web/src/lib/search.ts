import { prisma } from '@zello/db';
import type { Prisma, Weekday } from '@zello/db';
import type { ProfessionalCardData } from '@/components/public/professional-card';

export interface SearchParams {
  q?: string;
  category?: string;
  city?: string;
  state?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  date?: string;
  time?: string;
  order?: 'rating' | 'recent' | 'price-asc' | 'price-desc';
  page?: number;
  perPage?: number;
}

export interface SearchResult {
  total: number;
  page: number;
  perPage: number;
  items: ProfessionalCardData[];
}

const DEFAULT_PER_PAGE = 12;
const WEEKDAY_BY_INDEX: Weekday[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function parseDateOnly(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function combineDateTime(date: string, time: string): Date | null {
  const dt = parseDateOnly(date);
  if (!dt) return null;
  const [h, mm] = time.split(':').map(Number);
  if (h == null || mm == null) return null;
  const out = new Date(dt);
  out.setHours(h, mm, 0, 0);
  return out;
}

export async function searchProfessionals(params: SearchParams): Promise<SearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(48, Math.max(1, params.perPage ?? DEFAULT_PER_PAGE));

  const serviceWhere: Prisma.ServiceWhereInput = { active: true };

  if (params.category) {
    serviceWhere.category = { slug: params.category };
  }
  if (typeof params.priceMin === 'number') {
    serviceWhere.price = { ...((serviceWhere.price as Prisma.DecimalFilter) || {}), gte: params.priceMin };
  }
  if (typeof params.priceMax === 'number') {
    serviceWhere.price = { ...((serviceWhere.price as Prisma.DecimalFilter) || {}), lte: params.priceMax };
  }

  const where: Prisma.ProfessionalWhereInput = {
    user: { kycStatus: 'APPROVED', status: 'ACTIVE' },
    services: { some: serviceWhere },
  };

  if (params.q) {
    where.OR = [
      { user: { name: { contains: params.q, mode: 'insensitive' } } },
      { headline: { contains: params.q, mode: 'insensitive' } },
      { bio: { contains: params.q, mode: 'insensitive' } },
      { services: { some: { ...serviceWhere, title: { contains: params.q, mode: 'insensitive' } } } },
    ];
  }
  if (params.city) {
    where.city = { contains: params.city, mode: 'insensitive' };
  }
  if (params.state) {
    where.state = params.state.toUpperCase();
  }
  if (typeof params.minRating === 'number') {
    where.averageRating = { gte: params.minRating };
  }

  let targetDate: Date | null = null;
  let targetWeekday: Weekday | null = null;
  let targetDateTime: Date | null = null;

  if (params.date) {
    targetDate = parseDateOnly(params.date);
    if (targetDate) {
      targetWeekday = WEEKDAY_BY_INDEX[targetDate.getDay()] ?? null;
      if (targetWeekday) {
        const scheduleWhere: Prisma.ScheduleWhereInput = {
          weekday: targetWeekday,
          active: true,
        };
        if (params.time) {
          scheduleWhere.startTime = { lte: params.time };
          scheduleWhere.endTime = { gt: params.time };
          targetDateTime = combineDateTime(params.date, params.time);
        }
        where.schedules = { some: scheduleWhere };
      }
    }
  }

  const orderBy: Prisma.ProfessionalOrderByWithRelationInput[] =
    params.order === 'recent'
      ? [{ createdAt: 'desc' }]
      : params.order === 'price-asc' || params.order === 'price-desc'
        ? [{ averageRating: 'desc' }]
        : [{ averageRating: 'desc' }, { totalCompleted: 'desc' }];

  const candidatePerPage = targetDateTime ? perPage * 3 : perPage;

  const [totalRaw, professionalsRaw] = await Promise.all([
    prisma.professional.count({ where }),
    prisma.professional.findMany({
      where,
      orderBy,
      skip: targetDateTime ? 0 : (page - 1) * perPage,
      take: targetDateTime ? Math.min(candidatePerPage * page, 200) : perPage,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        services: {
          where: serviceWhere,
          orderBy: { price: params.order === 'price-desc' ? 'desc' : 'asc' },
          include: {
            category: { select: { id: true, name: true } },
            photos: { orderBy: { order: 'asc' }, take: 1 },
          },
        },
      },
    }),
  ]);

  let professionals = professionalsRaw;
  let total = totalRaw;

  if (targetDateTime) {
    const candidateIds = professionals.map((p) => p.id);
    const slotEnds = new Map<string, Date>();
    professionals.forEach((p) => {
      const minDuration = p.services.reduce(
        (min, s) => (s.durationMin < min ? s.durationMin : min),
        Number.POSITIVE_INFINITY,
      );
      const duration = Number.isFinite(minDuration) ? minDuration : 60;
      const end = new Date(targetDateTime.getTime() + duration * 60_000);
      slotEnds.set(p.id, end);
    });

    const maxEnd = Array.from(slotEnds.values()).reduce(
      (acc, d) => (d > acc ? d : acc),
      targetDateTime,
    );

    const [conflictingBookings, conflictingBlocks] = await Promise.all([
      prisma.booking.findMany({
        where: {
          professionalId: { in: candidateIds },
          status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'DISPUTED'] },
          scheduledAt: { lt: maxEnd },
          scheduledEnd: { gt: targetDateTime },
        },
        select: { professionalId: true, scheduledAt: true, scheduledEnd: true },
      }),
      prisma.scheduleBlock.findMany({
        where: {
          professionalId: { in: candidateIds },
          startsAt: { lt: maxEnd },
          endsAt: { gt: targetDateTime },
        },
        select: { professionalId: true, startsAt: true, endsAt: true },
      }),
    ]);

    const busy = new Set<string>();
    for (const b of conflictingBookings) {
      const end = slotEnds.get(b.professionalId);
      if (!end) continue;
      if (b.scheduledAt < end && b.scheduledEnd > targetDateTime) {
        busy.add(b.professionalId);
      }
    }
    for (const blk of conflictingBlocks) {
      const end = slotEnds.get(blk.professionalId);
      if (!end) continue;
      if (blk.startsAt < end && blk.endsAt > targetDateTime) {
        busy.add(blk.professionalId);
      }
    }

    professionals = professionals.filter((p) => !busy.has(p.id));
    total = professionals.length;
    const startIdx = (page - 1) * perPage;
    professionals = professionals.slice(startIdx, startIdx + perPage);
  }

  const items: ProfessionalCardData[] = professionals.map((p) => {
    const cats = new Map<string, { id: string; name: string }>();
    for (const s of p.services) {
      if (s.category) cats.set(s.category.id, s.category);
    }
    const cheapestService = p.services
      .slice()
      .sort((a, b) => Number(a.price) - Number(b.price))[0];
    const coverPhoto = p.services.flatMap((s) => s.photos)[0];

    return {
      slug: p.slug ?? p.id,
      name: p.user.name,
      headline: p.headline,
      city: p.city,
      state: p.state,
      bio: p.bio,
      avatarUrl: p.user.avatarUrl,
      averageRating: p.averageRating ? Number(p.averageRating) : null,
      totalReviews: p.totalReviews,
      totalCompleted: p.totalCompleted,
      categories: Array.from(cats.values()),
      cheapestService: cheapestService
        ? { id: cheapestService.id, price: Number(cheapestService.price), priceMode: cheapestService.priceMode }
        : null,
      serviceCount: p.services.length,
      coverPhotoUrl: coverPhoto?.url ?? null,
    };
  });

  if (params.order === 'price-asc' || params.order === 'price-desc') {
    items.sort((a, b) => {
      const ap = a.cheapestService?.price ?? Number.POSITIVE_INFINITY;
      const bp = b.cheapestService?.price ?? Number.POSITIVE_INFINITY;
      return params.order === 'price-asc' ? ap - bp : bp - ap;
    });
  }

  return { total, page, perPage, items };
}
