'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { SearchForm } from '@/components/public/search-form';

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
  const [, startTransition] = useTransition();

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

        <div className="mt-10">
          <SearchForm variant="hero" />
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
      </div>
    </section>
  );
}
