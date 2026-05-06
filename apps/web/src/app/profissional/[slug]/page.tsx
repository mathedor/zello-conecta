import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Briefcase,
  CalendarRange,
  CheckCircle2,
  Clock,
  ListChecks,
  MapPin,
  Star,
} from 'lucide-react';
import { prisma } from '@zello/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/public/star-rating';
import { ServiceMiniCard } from '@/components/public/service-mini-card';
import { WEEKDAYS } from '@/lib/service-schemas';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadProfessional(slug: string) {
  const pro = await prisma.professional.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, avatarUrl: true, status: true, kycStatus: true } },
      services: {
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          photos: { orderBy: { order: 'asc' } },
        },
      },
      schedules: { where: { active: true }, orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
    },
  });
  if (!pro) return null;
  if (pro.user.status !== 'ACTIVE' || pro.user.kycStatus !== 'APPROVED') return null;
  return pro;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pro = await loadProfessional(slug);
  if (!pro) return { title: 'Profissional não encontrado' };
  return {
    title: `${pro.user.name} — ${pro.headline ?? 'Profissional'}`,
    description: pro.bio?.slice(0, 160) ?? `${pro.user.name} oferece serviços na Zello Conecta.`,
  };
}

export default async function ProfissionalPage({ params }: PageProps) {
  const { slug } = await params;
  const pro = await loadProfessional(slug);
  if (!pro) notFound();

  const reviews = await prisma.review.findMany({
    where: {
      hidden: false,
      booking: { professionalId: pro.id, status: 'COMPLETED' },
    },
    include: {
      author: { select: { name: true, avatarUrl: true } },
      booking: { select: { service: { select: { title: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const initials =
    pro.user.name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'Z';

  const slotsByDay = WEEKDAYS.map((d) => ({
    ...d,
    slots: pro.schedules.filter((s) => s.weekday === d.key),
  }));

  const galleryPhotos = pro.services.flatMap((s) => s.photos.map((ph) => ph.url)).slice(0, 8);

  return (
    <main>
      <header className="relative overflow-hidden border-b border-border bg-gradient-to-b from-zello-50 to-background">
        <div className="container py-10 md:py-14">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:gap-8">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-card bg-zello-600 shadow-lg md:h-32 md:w-32">
              {pro.user.avatarUrl ? (
                <Image
                  src={pro.user.avatarUrl}
                  alt={pro.user.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white md:text-5xl">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verificado
                </Badge>
                {pro.city || pro.state ? (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {[pro.city, pro.state].filter(Boolean).join(', ')}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {pro.user.name}
              </h1>
              {pro.headline ? (
                <p className="mt-1 text-lg text-muted-foreground">{pro.headline}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {pro.averageRating ? (
                  <StarRating
                    value={Number(pro.averageRating)}
                    total={pro.totalReviews}
                    size="md"
                  />
                ) : (
                  <span className="text-muted-foreground italic">Sem avaliações ainda</span>
                )}
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Briefcase className="h-4 w-4 text-zello-600" />
                  {pro.services.length} serviço{pro.services.length === 1 ? '' : 's'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <ListChecks className="h-4 w-4 text-zello-600" />
                  {pro.totalCompleted} contratações concluídas
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {pro.bio ? (
              <section>
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">Sobre</h2>
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {pro.bio}
                </p>
              </section>
            ) : null}

            {galleryPhotos.length > 0 ? (
              <section>
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">Galeria</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {galleryPhotos.map((url) => (
                    <div
                      key={url}
                      className="relative aspect-square overflow-hidden rounded-xl bg-secondary"
                    >
                      <Image
                        src={url}
                        alt="Foto do trabalho"
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                  Serviços ({pro.services.length})
                </h2>
              </div>
              {pro.services.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Este profissional ainda não cadastrou serviços ativos.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {pro.services.map((s) => (
                    <ServiceMiniCard
                      key={s.id}
                      professionalSlug={pro.slug ?? pro.id}
                      service={{
                        id: s.id,
                        slug: s.slug,
                        title: s.title,
                        description: s.description,
                        price: Number(s.price),
                        priceMode: s.priceMode,
                        durationMin: s.durationMin,
                        locationMode: s.locationMode,
                        coverUrl: s.photos[0]?.url ?? null,
                        categoryName: s.category?.name ?? null,
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                  Avaliações ({pro.totalReviews})
                </h2>
                {pro.averageRating ? (
                  <StarRating value={Number(pro.averageRating)} size="lg" />
                ) : null}
              </div>
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center gap-3 p-8 text-muted-foreground">
                    <Star className="h-5 w-5" />
                    Ainda não há avaliações. Seja o primeiro a contratar.
                  </CardContent>
                </Card>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id}>
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zello-600 text-sm font-semibold text-white">
                              {r.author.name
                                .split(' ')
                                .map((p) => p[0])
                                .filter(Boolean)
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <div className="text-sm font-semibold">{r.author.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {r.booking.service.title} ·{' '}
                                    {r.createdAt.toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </div>
                                </div>
                                <StarRating value={r.rating} size="sm" showNumber={false} />
                              </div>
                              {r.comment ? (
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                  {r.comment}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-zello-600" />
                  <h3 className="font-semibold">Disponibilidade semanal</h3>
                </div>
                {slotsByDay.every((d) => d.slots.length === 0) ? (
                  <p className="text-sm text-muted-foreground">
                    Agenda ainda não configurada. Use o botão Agendar nos serviços.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {slotsByDay.map((d) => (
                      <li
                        key={d.key}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="w-12 font-medium">{d.short}</span>
                        <span className="flex-1 text-right text-muted-foreground">
                          {d.slots.length === 0
                            ? '—'
                            : d.slots.map((s) => `${s.startTime}–${s.endTime}`).join(' · ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-5 text-xs text-muted-foreground">
                  <Clock className="mr-1 inline h-3 w-3" />
                  Os horários disponíveis aparecem na hora de agendar cada serviço.
                </p>
                <Link
                  href="#"
                  className="mt-5 block rounded-xl bg-zello-50 p-4 text-center text-sm text-zello-800 hover:bg-zello-100"
                >
                  ↓ Escolha um serviço acima para agendar
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
