import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Heart, Lightbulb, Shield, Target, Users } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Quem somos',
  description:
    'Conheça a Zello Conecta: nossa missão, modelo de negócio transparente com taxa de 20% e como construímos a plataforma para conectar profissionais e clientes.',
};

const values = [
  { icon: Shield, title: 'Confiança em primeiro lugar', desc: 'Cada decisão de produto protege quem contrata e quem oferece. Sem letras miúdas.' },
  { icon: Target, title: 'Modelo transparente', desc: 'Cobramos 20% por venda. Sem mensalidade, sem custo escondido. Você sabe exatamente o que paga.' },
  { icon: Heart, title: 'Pessoas no centro', desc: 'Profissionais valorizados. Clientes ouvidos. Suporte de verdade quando algo precisa de mediação.' },
  { icon: Lightbulb, title: 'Tecnologia que serve', desc: 'Web e apps nativos. Agenda integrada com Google e iCal. Pagamento via cartão e PIX. Tudo onde você precisa.' },
];

export default function QuemSomosPage() {
  return (
    <main>
      <PageHero
        eyebrow="Quem somos"
        title="Conectando profissionais e pessoas, com confiança."
        description="A Zello Conecta nasceu para resolver um problema simples: contratar um profissional de qualidade não deveria ser difícil. Construímos a plataforma que faltava — com agenda integrada, pagamento seguro e avaliações reais."
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Nossa missão
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Tornar a contratação de serviços profissionais simples, segura e transparente para
              ambos os lados. Profissionais qualificados merecem uma plataforma que os valorize;
              clientes merecem uma experiência sem surpresas. É isso que a Zello faz.
            </p>
          </div>
        </div>
      </section>

      <section id="modelo" className="scroll-mt-24 border-t border-border/60 bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-zello-600">
                Modelo de negócio
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                20% por venda. Nada mais.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Esse é todo o nosso modelo. Você só paga quando vende. Sem assinatura, sem taxa de
                adesão, sem custo de manutenção da conta. Quanto mais transparente, melhor para
                todos.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  'Cliente paga R$ 100 por um serviço',
                  'Plataforma retém R$ 20 (taxa)',
                  'Profissional recebe R$ 80 líquidos',
                  'Saque via PIX quando o profissional quiser',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-zello-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-8">
                <Link href="/como-funciona">
                  Ver como funciona
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <Card className="border-zello-200 bg-gradient-to-br from-card to-zello-50/50">
              <CardContent className="p-8 md:p-10">
                <div className="text-xs font-semibold uppercase tracking-wider text-zello-600">
                  Exemplo prático
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-baseline justify-between border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">Valor do serviço</span>
                    <span className="text-2xl font-semibold">R$ 200,00</span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">Taxa Zello (20%)</span>
                    <span className="text-xl font-medium text-muted-foreground">- R$ 40,00</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-sm font-medium">Profissional recebe</span>
                    <span className="text-3xl font-bold text-zello-600">R$ 160,00</span>
                  </div>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Liberação em até 48h após a conclusão. Saque via PIX a qualquer momento, sem
                  taxa adicional.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-zello-600">
              Nossos valores
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              O que nos guia
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:gap-6">
            {values.map((v) => (
              <Card key={v.title} className="hover:border-zello-200 hover:shadow-md">
                <CardContent className="flex gap-5 p-7">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zello-50 text-zello-600">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{v.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="carreiras" className="scroll-mt-24 border-t border-border/60 bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Users className="mx-auto h-12 w-12 text-zello-600" />
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Quer fazer parte?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Estamos sempre abertos a profissionais talentosos que queiram construir o futuro dos
              serviços no Brasil. Mande seu currículo e uma carta contando por que a Zello faz
              sentido para você.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/contato?assunto=carreiras">
                Enviar candidatura
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
