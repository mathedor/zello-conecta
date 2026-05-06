import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, ImagePlus, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LOCATION_MODE_LABELS, PRICE_MODE_LABELS } from '@/lib/service-schemas';

interface ServiceMiniCardProps {
  service: {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    priceMode: 'HOURLY' | 'FIXED';
    durationMin: number;
    locationMode: 'ON_SITE' | 'PROFESSIONAL_LOCATION' | 'REMOTE' | 'BOTH';
    coverUrl: string | null;
    categoryName: string | null;
  };
  professionalSlug: string;
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function ServiceMiniCard({ service, professionalSlug }: ServiceMiniCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-zello-200 hover:shadow-md">
      <div className="relative aspect-video bg-secondary">
        {service.coverUrl ? (
          <Image
            src={service.coverUrl}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImagePlus className="h-8 w-8" />
          </div>
        )}
        {service.categoryName ? (
          <div className="absolute left-3 top-3">
            <Badge variant="soft" className="backdrop-blur-sm">
              {service.categoryName}
            </Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight">{service.title}</h3>
        <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{service.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {service.durationMin} min
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {LOCATION_MODE_LABELS[service.locationMode]}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
          <div>
            <div className="text-xs text-muted-foreground">
              {PRICE_MODE_LABELS[service.priceMode]}
            </div>
            <div className="text-xl font-bold text-zello-600">
              {formatBRL(service.price)}
              {service.priceMode === 'HOURLY' ? (
                <span className="text-sm font-normal text-muted-foreground"> /h</span>
              ) : null}
            </div>
          </div>
          <Link
            href={`/agendar/${service.id}?profissional=${professionalSlug}`}
            className="inline-flex items-center gap-1 rounded-lg bg-zello-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zello-700"
          >
            Agendar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
