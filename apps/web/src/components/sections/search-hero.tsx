'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Loader2, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
}

const POPULAR_TERMS = [
  'Diarista',
  'Eletricista',
  'Advogado',
  'Personal trainer',
  'Designer',
  'Encanador',
];

export function SearchHero() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    fetch('/api/categorias')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (city.trim()) params.set('city', city.trim());
    if (category) params.set('category', category);
    startTransition(() => {
      router.push(`/buscar${params.toString() ? `?${params.toString()}` : ''}`);
    });
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-zello-900 via-zello-800 to-zello-600"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"
      />
      <svg
        aria-hidden
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 -z-10 h-12 w-full text-background md:h-20"
      >
        <path
          fill="currentColor"
          d="M0,80 C240,30 480,10 720,30 C960,50 1080,70 1200,50 L1200,80 L0,80 Z"
        />
      </svg>

      <div className="container pt-10 pb-24 md:pt-16 md:pb-32 lg:pt-24 lg:pb-40">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="soft"
            className="mb-5 inline-flex gap-2 border-white/10 bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Profissionais verificados em todo o Brasil
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            O serviço certo,{' '}
            <span className="bg-gradient-to-r from-white to-zello-200 bg-clip-text text-transparent">
              na hora certa
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-zello-100 sm:text-lg">
            Encontre profissionais verificados, agende e pague com segurança. O valor fica retido
            até você confirmar a conclusão do serviço.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mx-auto mt-10 max-w-5xl"
          aria-label="Busca de profissionais"
        >
          <div className="rounded-3xl border border-white/15 bg-white/95 p-2 shadow-2xl backdrop-blur-md md:rounded-full md:p-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-stretch md:gap-0">
              <Field
                icon={<Search className="h-4 w-4" />}
                label="O que você precisa?"
                value={q}
                onChange={setQ}
                placeholder="Diarista, advogado, personal..."
                first
              />
              <Field
                icon={<MapPin className="h-4 w-4" />}
                label="Cidade"
                value={city}
                onChange={setCity}
                placeholder="São Paulo"
              />
              <FieldSelect
                icon={<LayoutGrid className="h-4 w-4" />}
                label="Categoria"
                value={category}
                onChange={setCategory}
                options={categories}
              />
              <div className="flex items-stretch p-1 md:p-1">
                <Button
                  type="submit"
                  size="lg"
                  disabled={pending}
                  className="h-12 w-full md:h-auto md:rounded-full md:px-7"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-xs uppercase tracking-wider text-zello-200">
              Buscas populares:
            </span>
            {POPULAR_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQ(term);
                  startTransition(() => {
                    router.push(`/buscar?q=${encodeURIComponent(term)}`);
                  });
                }}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                {term}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  first,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  first?: boolean;
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-2xl px-4 py-2 transition-colors hover:bg-zello-50/70 md:rounded-full',
        first ? 'md:pl-6' : '',
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zello-50 text-zello-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/60 md:text-sm"
        />
      </div>
    </div>
  );
}

function FieldSelect({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: CategoryOption[];
}) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl px-4 py-2 transition-colors hover:bg-zello-50/70 md:rounded-full">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zello-50 text-zello-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer bg-transparent text-base font-medium text-foreground outline-none md:text-sm"
        >
          <option value="">Todas</option>
          {options.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
