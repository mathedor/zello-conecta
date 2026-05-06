import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { prisma } from '@zello/db';
import { serviceCreateSchema, slugify } from '@/lib/service-schemas';
import { requireProfessional } from '@/lib/professional-guard';

export const runtime = 'nodejs';

export async function GET() {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;

  const services = await prisma.service.findMany({
    where: { professionalId: guard.professional.id },
    include: { category: true, photos: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ services });
}

export async function POST(req: Request) {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = serviceCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  let categoryId = data.categoryId ?? null;

  if (!categoryId && data.newCategoryName) {
    const slug = slugify(data.newCategoryName);
    const existing = await prisma.category.findUnique({ where: { slug } });
    const cat = existing
      ? existing
      : await prisma.category.create({
          data: {
            name: data.newCategoryName,
            slug,
            approved: false,
            suggestedBy: guard.session.user.id,
          },
        });
    categoryId = cat.id;
  }

  const baseSlug = slugify(`${data.title}-${guard.professional.id.slice(-6)}`) || nanoid(10);
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.service.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const service = await prisma.service.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      priceMode: data.priceMode,
      price: data.price,
      durationMin: data.durationMin,
      locationMode: data.locationMode,
      active: data.active,
      professionalId: guard.professional.id,
      categoryId,
      photos: data.photos.length
        ? {
            create: data.photos.map((url, i) => ({ url, order: i })),
          }
        : undefined,
    },
    include: { photos: true, category: true },
  });

  return NextResponse.json({ service });
}
