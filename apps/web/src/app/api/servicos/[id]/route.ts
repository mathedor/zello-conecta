import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { serviceUpdateSchema, slugify } from '@/lib/service-schemas';
import { requireProfessional } from '@/lib/professional-guard';

export const runtime = 'nodejs';

async function ensureOwnership(id: string, professionalId: string) {
  const svc = await prisma.service.findUnique({ where: { id } });
  if (!svc) return null;
  if (svc.professionalId !== professionalId) return null;
  return svc;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: 'asc' } }, category: true },
  });
  if (!service || service.professionalId !== guard.professional.id) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }
  return NextResponse.json({ service });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const existing = await ensureOwnership(id, guard.professional.id);
  if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = serviceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  let categoryId = data.categoryId === undefined ? existing.categoryId : (data.categoryId ?? null);
  if (data.newCategoryName) {
    const slug = slugify(data.newCategoryName);
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: data.newCategoryName,
        slug,
        approved: false,
        suggestedBy: guard.session.user.id,
      },
    });
    categoryId = cat.id;
  }

  const updateData: Record<string, unknown> = {
    title: data.title ?? existing.title,
    description: data.description ?? existing.description,
    priceMode: data.priceMode ?? existing.priceMode,
    price: data.price ?? Number(existing.price),
    durationMin: data.durationMin ?? existing.durationMin,
    locationMode: data.locationMode ?? existing.locationMode,
    active: data.active ?? existing.active,
    categoryId,
  };

  if (data.title && data.title !== existing.title) {
    const baseSlug = slugify(`${data.title}-${guard.professional.id.slice(-6)}`);
    let slug = baseSlug;
    let attempt = 0;
    while (
      slug !== existing.slug &&
      (await prisma.service.findUnique({ where: { slug } }))
    ) {
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }
    updateData.slug = slug;
  }

  const service = await prisma.service.update({
    where: { id },
    data: updateData,
    include: { photos: { orderBy: { order: 'asc' } }, category: true },
  });

  if (data.photos) {
    await prisma.servicePhoto.deleteMany({ where: { serviceId: id } });
    if (data.photos.length > 0) {
      await prisma.servicePhoto.createMany({
        data: data.photos.map((url: string, i: number) => ({ serviceId: id, url, order: i })),
      });
    }
  }

  return NextResponse.json({ service });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireProfessional();
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const existing = await ensureOwnership(id, guard.professional.id);
  if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
