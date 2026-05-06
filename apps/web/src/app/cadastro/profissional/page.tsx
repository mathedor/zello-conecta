import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, CalendarRange, Clock, Shield, Star, Wallet } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Cadastro de profissional',
  description:
    'Cadastre-se gratuitamente como profissional na Zello Conecta. Sem mensalidade, taxa de 20% só por venda concluída.',
};

const benefits = [
  { icon: Wallet, title: 'Sem mensalidade', desc: 'Taxa de 20% só por venda. Você só paga quando vende.' },
  { icon: CalendarRange, title: 'Agenda integrada', desc: 'Sincroniza com Google Calendar e iCal. Bloqueios pontuais.' },
  { icon: Star, title: 'Reputação que cresce', desc: 'Avaliações reais aparecem no seu perfil para futuros clientes.' },
  { icon: BarChart3, title: 'Relatórios completos', desc: 'Acompanhe faturamento, clientes atendidos e desempenho.' },
  { icon: Shield, title: 'Pagamento garantido', desc: 'Valor retido pela plataforma. Liberação em até 48h após o serviço.' },
  { icon: Clock, title: 'Saque rápido', desc: 'Solicite saque via PIX a qualquer momento. Sem prazo mínimo.' },
];

export default function CadastroProfissionalPage() {
  return (
    <main>
      <PageHero
        eyebrow="Para profissionais"
        title="Comece a vender em poucos passos"
        description="Cadastro 100% gratuito. Você define o que oferece, quanto cobra e quando atende. A Zello cuida do agendamento, pagamento e suporte."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="xl" className="w-full sm:w-auto">
            <Link href="/cadastro/profissional/wizard">
              Iniciar cadastro
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
            <Link href="/como-funciona">Como funciona</Link>
          </Button>
        </div>
      </PageHero>

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <Card key={b.title} className="hover:border-zello-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zello-50 text-zello-600">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Como funciona o cadastro
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Em menos de 10 minutos você está pronto para receber sua primeira reserva.
            </p>
          </div>

          <ol className="mx-auto mt-12 max-w-3xl space-y-4">
            {[
              { step: '1.', title: 'Conta e dados básicos', desc: 'Nome, email, telefone, CPF e título profissional.' },
              { step: '2.', title: 'Documentação (KYC)', desc: 'Envie RG/CNH e selfie. Aprovação em até 24 horas úteis.' },
              { step: '3.', title: 'Cadastre seus serviços', desc: 'Título, descrição, fotos, preço por hora ou empreitada.' },
              { step: '4.', title: 'Configure sua agenda', desc: 'Horários da semana e bloqueios pontuais. Pronto para receber clientes.' },
            ].map((s) => (
              <li key={s.step} className="flex gap-5 rounded-2xl border border-border bg-card p-6">
                <div className="text-2xl font-bold text-zello-600">{s.step}</div>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 text-center">
            <Button asChild size="xl">
              <Link href="/cadastro/profissional/wizard">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
