import { redirect } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { CategoriasManager } from './categorias-manager';

export const metadata = { title: 'Categorias' };

export default async function AdminCategoriasPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  const categories = await prisma.category.findMany({
    orderBy: [{ approved: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { services: true } } },
  });

  return (
    <DashboardShell
      title="Categorias"
      description={`${categories.length} cadastradas. Aprove sugestões de profissionais e crie novas.`}
    >
      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <LayoutGrid className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma categoria.</p>
            </div>
          ) : (
            <CategoriasManager
              initial={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                iconName: c.iconName,
                approved: c.approved,
                serviceCount: c._count.services,
                suggestedBy: c.suggestedBy,
                createdAt: c.createdAt.toISOString(),
              }))}
            />
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
