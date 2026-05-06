import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ImagePlus, ListPlus, Pencil } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRICE_MODE_LABELS, LOCATION_MODE_LABELS } from '@/lib/service-schemas';
import { ServiceActions } from './service-actions';

export const metadata = { title: 'Meus serviços' };

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default async function ServicosPage() {
  const session = await auth();
  if (!session?.user) redirect('/entrar');

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) redirect('/painel-pro');

  const services = await prisma.service.findMany({
    where: { professionalId: professional.id },
    include: { category: true, photos: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell
      title="Meus serviços"
      description="Cada serviço aparece nas buscas para clientes da sua categoria."
      actions={
        <Button asChild>
          <Link href="/painel-pro/servicos/novo">
            <ListPlus className="h-4 w-4" />
            Novo serviço
          </Link>
        </Button>
      }
    >
      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center md:p-16">
            <ImagePlus className="h-12 w-12 text-zello-600" />
            <h2 className="text-xl font-semibold">Nenhum serviço cadastrado ainda</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Crie seu primeiro serviço para começar a aparecer nas buscas. Você pode editar ou
              desativar a qualquer momento.
            </p>
            <Button asChild size="lg" className="mt-2">
              <Link href="/painel-pro/servicos/novo">
                <ListPlus className="h-4 w-4" />
                Criar primeiro serviço
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => {
            const cover = s.photos[0]?.url;
            return (
              <Card key={s.id} className="overflow-hidden">
                <div className="relative aspect-[16/10] bg-secondary">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={s.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImagePlus className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    {s.active ? (
                      <Badge variant="success">Ativo</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-card">
                        Pausado
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold">{s.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {s.category?.name ?? 'Sem categoria'}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/painel-pro/servicos/${s.id}/editar`}>
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {PRICE_MODE_LABELS[s.priceMode]}
                      </div>
                      <div className="text-xl font-bold text-zello-600">
                        {formatBRL(Number(s.price))}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{s.durationMin} min</div>
                      <div>{LOCATION_MODE_LABELS[s.locationMode]}</div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <ServiceActions id={s.id} active={s.active} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
