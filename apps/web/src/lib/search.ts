import { prisma } from '@zello/db';
import type { Prisma } from '@zello/db';
import type { ProfessionalCardData } from '@/components/public/professional-card';

export interface SearchParams {
  q?: string;
  category?: string;
  city?: string;
  state?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
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

  const orderBy: Prisma.ProfessionalOrderByWithRelationInput[] =
    params.order === 'recent'
      ? [{ createdAt: 'desc' }]
      : params.order === 'price-asc' || params.order === 'price-desc'
        ? [{ averageRating: 'desc' }]
        : [{ averageRating: 'desc' }, { totalCompleted: 'desc' }];

  const [total, professionals] = await Promise.all([
    prisma.professional.count({ where }),
    prisma.professional.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
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
