import { prisma, type BookingStatus } from '@zello/db';

export interface AdminStats {
  totals: {
    users: number;
    professionals: number;
    activeProfessionals: number;
    bookings: number;
    completedBookings: number;
    grossSales: number;
    platformFee: number;
    averageTicket: number;
  };
  weekGrowth: {
    newUsers: number;
    newBookings: number;
    grossSales: number;
  };
  bookingsByDay: { date: string; count: number; gmv: number }[];
  topCategories: { name: string; bookings: number; gmv: number }[];
  recentActivity: {
    id: string;
    title: string;
    detail: string;
    href: string | null;
    date: string;
  }[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);

  const completedStatuses: BookingStatus[] = ['COMPLETED'];

  const [
    users,
    professionals,
    activeProfessionals,
    bookings,
    completedAgg,
    weekUsers,
    weekBookings,
    weekSalesAgg,
    last30Bookings,
    topCategoriesData,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
    prisma.professional.count({
      where: { user: { kycStatus: 'APPROVED', status: 'ACTIVE' } },
    }),
    prisma.booking.count(),
    prisma.booking.aggregate({
      where: { status: { in: completedStatuses } },
      _sum: { totalAmount: true, platformFee: true },
      _count: { id: true },
      _avg: { totalAmount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.booking.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.booking.aggregate({
      where: { status: { in: completedStatuses }, createdAt: { gte: weekAgo } },
      _sum: { totalAmount: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, totalAmount: true, status: true },
    }),
    prisma.booking.groupBy({
      by: ['serviceId'],
      where: { status: { in: completedStatuses } },
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        client: { select: { name: true } },
        service: { select: { title: true } },
      },
    }),
  ]);

  const dayMap = new Map<string, { count: number; gmv: number }>();
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { count: 0, gmv: 0 });
  }
  for (const b of last30Bookings) {
    const key = b.createdAt.toISOString().slice(0, 10);
    const cur = dayMap.get(key);
    if (!cur) continue;
    cur.count += 1;
    if (b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
      cur.gmv += Number(b.totalAmount);
    }
  }

  const bookingsByDay = Array.from(dayMap.entries()).map(([date, v]) => ({
    date,
    count: v.count,
    gmv: Math.round(v.gmv * 100) / 100,
  }));

  const serviceIds = topCategoriesData.map((c) => c.serviceId);
  const topServices = serviceIds.length
    ? await prisma.service.findMany({
        where: { id: { in: serviceIds } },
        include: { category: { select: { name: true } } },
      })
    : [];
  const categoryAgg = new Map<string, { bookings: number; gmv: number }>();
  for (const c of topCategoriesData) {
    const svc = topServices.find((s) => s.id === c.serviceId);
    const name = svc?.category?.name ?? 'Sem categoria';
    const cur = categoryAgg.get(name) ?? { bookings: 0, gmv: 0 };
    cur.bookings += c._count.id;
    cur.gmv += Number(c._sum.totalAmount ?? 0);
    categoryAgg.set(name, cur);
  }
  const topCategories = Array.from(categoryAgg.entries())
    .map(([name, v]) => ({ name, bookings: v.bookings, gmv: Math.round(v.gmv * 100) / 100 }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);

  return {
    totals: {
      users,
      professionals,
      activeProfessionals,
      bookings,
      completedBookings: completedAgg._count.id,
      grossSales: Number(completedAgg._sum.totalAmount ?? 0),
      platformFee: Number(completedAgg._sum.platformFee ?? 0),
      averageTicket: Number(completedAgg._avg.totalAmount ?? 0),
    },
    weekGrowth: {
      newUsers: weekUsers,
      newBookings: weekBookings,
      grossSales: Number(weekSalesAgg._sum.totalAmount ?? 0),
    },
    bookingsByDay,
    topCategories,
    recentActivity: recentBookings.map((b) => ({
      id: b.id,
      title: `${b.client.name} → ${b.service.title}`,
      detail: `${b.status} · R$ ${Number(b.totalAmount).toFixed(2).replace('.', ',')}`,
      href: null,
      date: b.createdAt.toISOString(),
    })),
  };
}
