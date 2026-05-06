import Link from 'next/link';
import { ArrowRight, Search, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-zello-50 via-background to-background"
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-zello-200/30 blur-3xl"
      />

      <div className="container py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="soft" className="mb-6 inline-flex gap-2 px-4 py-1.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zello-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-zello-500" />
            </span>
            Em breve nas lojas iOS e Android
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            O serviço certo,{' '}
            <span className="bg-gradient-to-r from-zello-600 via-zello-500 to-zello-400 bg-clip-text text-transparent">
              na hora certa
            </span>
          </h1>

          <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Encontre profissionais verificados de qualquer setor, agende com poucos cliques e pague
            com segurança. Tudo num só lugar, com o valor retido até você confirmar que o serviço
            foi concluído.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/buscar">
                <Search className="h-5 w-5" />
                Buscar profissionais
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
              <Link href="/cadastro/profissional">
                Sou profissional
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Shield, text: 'Pagamento retido até concluir' },
              { icon: Zap, text: 'Agendamento em segundos' },
              { icon: Search, text: 'Profissionais verificados' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-muted-foreground backdrop-blur-sm"
              >
                <item.icon className="h-4 w-4 text-zello-600" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
