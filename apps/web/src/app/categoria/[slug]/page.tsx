import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@zello/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return { title: 'Categoria' };
  return {
    title: cat.name,
    description: `Profissionais de ${cat.name} verificados pela Zello Conecta.`,
  };
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug, approved: true } });
  if (!cat) notFound();
  redirect(`/buscar?category=${cat.slug}`);
}
