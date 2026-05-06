import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, MapPin } from 'lucide-react';
import { StarRating } from './star-rating';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryItem {
  id: string;
  name: string;
}

interface ServiceMini {
  id: string;
  price: number;
  priceMode: 'HOURLY' | 'FIXED';
}

interface ProfessionalCardData {
  slug: string;
  name: string;
  headline: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  avatarUrl: string | null;
  averageRating: number | null;
  totalReviews: number;
  totalCompleted: number;
  categories: CategoryItem[];
  cheapestService: ServiceMini | null;
  serviceCount: number;
  coverPhotoUrl: string | null;
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function ProfessionalCard({
  data,
  className,
}: {
  data: ProfessionalCardData;
  className?: string;
}) {
  const initials =
    data.name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'Z';

  return (
    <Link
      href={`/profissional/${data.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-zello-200 hover:shadow-lg',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {data.coverPhotoUrl ? (
          <Image
            src={data.coverPhotoUrl}
            alt={data.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zello-100 to-zello-50">
            <span className="text-7xl font-bold text-zello-200">{initials}</span>
          </div>
        )}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <Badge variant="success" className="gap-1 backdrop-blur-sm">
            <CheckCircle2 className="h-3 w-3" />
            Verificado
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <div className="relative -mt-12 h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-zello-600 shadow-md">
            {data.avatarUrl ? (
              <Image
                src={data.avatarUrl}
                alt={data.name}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="truncate font-semibold leading-tight">{data.name}</h3>
            {data.headline ? (
              <p className="line-clamp-1 text-xs text-muted-foreground">{data.headline}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {data.averageRating ? (
            <StarRating value={data.averageRating} total={data.totalReviews} size="sm" />
          ) : (
            <span className="italic">Sem avaliações ainda</span>
          )}
          {data.totalCompleted > 0 ? (
            <span>· {data.totalCompleted} contratações</span>
          ) : null}
          {data.city || data.state ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {[data.city, data.state].filter(Boolean).join(', ')}
            </span>
          ) : null}
        </div>

        {data.categories.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.categories.slice(0, 3).map((cat) => (
              <Badge key={cat.id} variant="soft">
                {cat.name}
              </Badge>
            ))}
            {data.categories.length > 3 ? (
              <Badge variant="outline" className="text-muted-foreground">
                +{data.categories.length - 3}
              </Badge>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
          <div>
            <div className="text-xs text-muted-foreground">A partir de</div>
            <div className="text-lg font-bold text-zello-600">
              {data.cheapestService
                ? formatBRL(data.cheapestService.price)
                : 'Sob consulta'}
              {data.cheapestService?.priceMode === 'HOURLY' ? (
                <span className="text-sm font-normal text-muted-foreground"> /h</span>
              ) : null}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {data.serviceCount} serviço{data.serviceCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </Link>
  );
}

export type { ProfessionalCardData };
