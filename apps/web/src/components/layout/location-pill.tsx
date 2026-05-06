'use client';

import Link from 'next/link';
import { Loader2, MapPin } from 'lucide-react';
import { useGeolocation } from '@/lib/use-geolocation';

export function LocationPill() {
  const geo = useGeolocation();

  if (geo.status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Localizando...
      </span>
    );
  }

  if (geo.status === 'ready' && geo.city) {
    const label = `${geo.city}${geo.state ? `, ${geo.state}` : ''}`;
    const href = `/buscar?city=${encodeURIComponent(geo.city)}${geo.state ? `&state=${encodeURIComponent(geo.state)}` : ''}`;
    return (
      <Link
        href={href}
        className="inline-flex max-w-[180px] items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-zello-50 hover:text-zello-700"
        title={`Buscar em ${label}`}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-zello-600" />
        <span className="truncate">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/buscar"
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <MapPin className="h-3.5 w-3.5" />
      <span>Definir cidade</span>
    </Link>
  );
}
