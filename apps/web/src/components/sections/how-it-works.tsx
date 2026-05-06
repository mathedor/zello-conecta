import { CalendarCheck, CreditCard, Search, ThumbsUp } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Encontre',
    description:
      'Busque por categoria, cidade ou tipo de serviço. Veja avaliações, fotos, preços e horários disponíveis.',
  },
  {
    icon: CalendarCheck,
    title: 'Agende',
    description:
      'Selecione um horário livre na agenda do profissional e reserve em segundos. Você recebe confirmação imediata.',
  },
  {
    icon: CreditCard,
    title: 'Pague com segurança',
    description:
      'Cartão (Stripe) ou PIX (Efí). O valor fica retido até você confirmar a conclusão — proteção total.',
  },
  {
    icon: ThumbsUp,
    title: 'Avalie',
    description:
      'Após o serviço, deixe sua avaliação. Sua experiência ajuda outros clientes a escolherem com confiança.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-border/60 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-zello-600">
            Como funciona
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Quatro passos. Sem burocracia.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            O processo todo cabe na palma da mão. Para clientes ou profissionais.
          </p>
        </div>

        <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="rounded-2xl border border-border bg-card p-7 transition-all hover:border-zello-200 hover:shadow-md">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zello-600 text-white shadow-md shadow-zello-600/20">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zello-600">
                  Passo {i + 1}
                </div>
                <h3 className="text-lg font-semibold leading-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
