import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Clock, ImagePlus, MapPin } from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { getServiceAvailability } from '@/lib/availability';
import { LOCATION_MODE_LABELS, PRICE_MODE_LABELS } from '@/lib/service-schemas';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingPicker } from './booking-picker';

export const metadata = { title: 'Agendar serviço' };

interface PageProps {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{ profissional?: string }>;
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default async function AgendarPage({ params, searchParams }: PageProps) {
  const { serviceId } = await params;
  const { profissional: _profSlug } = await searchParams;

  const session = await auth();
  if (!session?.user) {
    redirect(`/entrar?next=${encodeURIComponent(`/agendar/${serviceId}`)}`);
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      photos: { orderBy: { order: 'asc' } },
      category: { select: { name: true } },
      professional: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  if (!service || !service.active || !service.professional) notFound();
  if (service.professional.user.id === session.user.id) {
    redirect(`/profissional/${service.professional.slug ?? service.professional.id}`);
  }

  const availability = await getServiceAvailability({
    serviceId,
    startDate: new Date(),
    days: 14,
  });

  const cover = service.photos[0]?.url;

  return (
    <main className="container py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[16/9] bg-secondary">
              {cover ? (
                <Image
                  src={cover}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImagePlus className="h-12 w-12" />
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                {service.category ? <Badge variant="soft">{service.category.name}</Badge> : null}
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {service.durationMin} min
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {LOCATION_MODE_LABELS[service.locationMode]}
                </Badge>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{service.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                com{' '}
                <a
                  href={`/profissional/${service.professional.slug ?? service.professional.id}`}
                  className="font-medium text-zello-600 hover:underline"
                >
                  {service.professional.user.name}
                </a>
              </p>

              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-lg font-semibold">Escolha data e horário</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Próximos 14 dias com horários disponíveis na agenda do profissional.
              </p>
              <div className="mt-6">
                <BookingPicker serviceId={serviceId} initialAvailability={availability} />
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Resumo
              </div>
              <h3 className="mt-1 text-base font-semibold">{service.title}</h3>
              <div className="my-5 h-px bg-border" />

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Profissional</dt>
                  <dd className="font-medium">{service.professional.user.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cobrança</dt>
                  <dd className="font-medium">{PRICE_MODE_LABELS[service.priceMode]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Duração</dt>
                  <dd className="font-medium">{service.durationMin} min</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-4">
                  <dt className="text-base font-medium">Total</dt>
                  <dd className="text-2xl font-bold text-zello-600">
                    {formatBRL(Number(service.price))}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-xs text-muted-foreground">
                Pagamento <strong>retido pela Zello</strong> até você confirmar a conclusão. Taxa
                de 20% inclusa.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
