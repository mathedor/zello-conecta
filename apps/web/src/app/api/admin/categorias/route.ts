import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/service-schemas';

export const runtime = 'nodejs';

const categorySchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(200).optional().or(z.literal('')),
  iconName: z.string().max(60).optional().or(z.literal('')),
  approved: z.boolean().default(true),
  parentId: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const slug = slugify(parsed.data.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: 'Já existe categoria com esse nome' }, { status: 409 });
  }

  const cat = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      iconName: parsed.data.iconName || null,
      approved: parsed.data.approved,
      parentId: parsed.data.parentId || null,
    },
  });

  return NextResponse.json({ category: cat });
}
