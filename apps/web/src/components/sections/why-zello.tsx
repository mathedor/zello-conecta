import { LucideIcon, MapPin, Search, Shield, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const pillars: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Star,
    title: 'Avaliações reais',
    description: 'Cada profissional tem nota média e comentários verificados de clientes anteriores.',
  },
  {
    icon: Shield,
    title: 'Pagamento seguro',
    description: 'Valor retido pela plataforma até você confirmar que o serviço foi concluído.',
  },
  {
    icon: ShieldCheck,
    title: 'Profissionais verificados',
    description: 'Verificação obrigatória de identidade (KYC) com CPF e documento antes da aprovação.',
  },
  {
    icon: Search,
    title: 'Busca inteligente',
    description: 'Filtros por categoria, cidade, raio em km, faixa de preço e nota mínima.',
  },
  {
    icon: MapPin,
    title: 'Geolocalização',
    description: 'Encontre quem está disponível perto de você ou em qualquer cidade do Brasil.',
  },
  {
    icon: Sparkles,
    title: 'Garantia Zello',
    description: 'Se algo der errado, abra uma disputa em até 48h e nossa equipe medeia a resolução.',
  },
];

export function WhyZelloSection() {
  return (
    <section className="border-t border-border/60 bg-background py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-zello-600">
            Por que Zello Conecta
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Confiança em cada etapa
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Construímos a plataforma com foco em transparência, segurança e experiência. Cada
            decisão de produto protege quem contrata e quem oferece.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <Card
              key={p.title}
              className="group transition-all hover:-translate-y-0.5 hover:border-zello-200 hover:shadow-lg"
            >
              <CardContent className="p-7">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zello-50 text-zello-600 transition-colors group-hover:bg-zello-600 group-hover:text-white">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold leading-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
