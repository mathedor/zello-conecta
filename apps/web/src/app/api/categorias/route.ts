import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { approved: true },
    orderBy: { name: 'asc' },
    select: { id: true, slug: true, name: true, iconName: true },
  });
  return NextResponse.json({ categories });
}
