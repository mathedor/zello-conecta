import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaFinalSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-zello-200 bg-gradient-to-br from-zello-600 via-zello-600 to-zello-800 px-8 py-16 text-center md:px-16 md:py-24">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Pronto para começar?
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-zello-50 sm:text-lg">
              Junte-se à plataforma que está mudando a forma como o Brasil contrata serviços. Para
              clientes ou profissionais — o cadastro é grátis em ambos os lados.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" className="w-full bg-white text-zello-700 hover:bg-zello-50 sm:w-auto">
                <Link href="/cadastro">
                  Quero contratar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="w-full border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto"
              >
                <Link href="/cadastro/profissional">Quero oferecer serviços</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
