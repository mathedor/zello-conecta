import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Briefcase,
  GraduationCap,
  Hammer,
  Heart,
  Laptop,
  type LucideIcon,
  Palette,
  PartyPopper,
  Scale,
  Search,
  Sparkle,
  Sparkles,
} from 'lucide-react';
import { prisma } from '@zello/db';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Navegue pelas categorias de serviços disponíveis na Zello Conecta.',
};

export const dynamic = 'force-dynamic';

const ICON_MAP: Record<string, LucideIcon> = {
  scale: Scale,
  sparkles: Sparkles,
  hammer: Hammer,
  laptop: Laptop,
  'heart-pulse': Heart,
  'graduation-cap': GraduationCap,
  'party-popper': PartyPopper,
  sparkle: Sparkle,
  briefcase: Briefcase,
  palette: Palette,
};

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    where: { approved: true },
    include: {
      _count: {
        select: {
          services: {
            where: {
              active: true,
              professional: { user: { kycStatus: 'APPROVED', status: 'ACTIVE' } },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <main>
      <PageHero
        eyebrow="Explore"
        title="Categorias de serviços"
        description="Navegue por área. Cada categoria reúne profissionais verificados, com pagamento seguro e agenda integrada."
      >
        <Button asChild size="lg">
          <Link href="/buscar">
            <Search className="h-4 w-4" />
            Buscar profissionais
          </Link>
        </Button>
      </PageHero>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((cat) => {
              const Icon = (cat.iconName && ICON_MAP[cat.iconName]) || Briefcase;
              return (
                <Link
                  key={cat.id}
                  href={`/buscar?category=${cat.slug}`}
                  className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-zello-300 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zello-50 text-zello-600 transition-colors group-hover:bg-zello-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold leading-tight">{cat.name}</h3>
                    {cat.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs font-medium text-zello-600">
                      {cat._count.services} profissional
                      {cat._count.services === 1 ? '' : 'es'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma categoria publicada ainda.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
