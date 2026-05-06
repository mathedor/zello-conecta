import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  CalendarRange,
  CreditCard,
  FileCheck,
  Search,
  Shield,
  Star,
  Upload,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Como funciona',
  description:
    'Entenda em detalhes como contratar serviços e como oferecer serviços na Zello Conecta. Passo a passo para clientes e profissionais.',
};

const clientSteps = [
  {
    icon: Search,
    title: 'Busque o profissional certo',
    description:
      'Use a busca para encontrar serviços por categoria, cidade ou nome. Filtre por nota, preço e raio em km. Compare perfis com avaliações reais.',
  },
  {
    icon: CalendarCheck,
    title: 'Escolha um horário disponível',
    description:
      'Veja a agenda do profissional em tempo real e selecione o melhor horário. Se for atendimento em local seu, informe o endereço.',
  },
  {
    icon: CreditCard,
    title: 'Pague com cartão ou PIX',
    description:
      'Pagamento via Stripe (cartão) ou Efí (PIX). O valor fica retido pela plataforma, não vai direto para o profissional — você está protegido.',
  },
  {
    icon: Shield,
    title: 'Acompanhe e confirme',
    description:
      'Receba notificações antes do horário. Após o serviço, clique em "Concluído" para liberar o pagamento, ou abra disputa se algo der errado.',
  },
  {
    icon: Star,
    title: 'Avalie a experiência',
    description:
      'Deixe sua nota e comentário. Sua avaliação aparece no perfil do profissional e ajuda outros clientes a contratarem com confiança.',
  },
];

const proSteps = [
  {
    icon: UserPlus,
    title: 'Cadastre-se em minutos',
    description:
      'Preencha dados básicos (nome, email, CPF/CNPJ) e crie sua conta. Cadastro 100% gratuito, sem mensalidade nem taxa de adesão.',
  },
  {
    icon: FileCheck,
    title: 'Verifique sua identidade',
    description:
      'Envie documento (RG/CNH) e selfie para validação obrigatória. Aprovação em até 24h. Isso protege você e dá confiança aos clientes.',
  },
  {
    icon: Upload,
    title: 'Cadastre seus serviços',
    description:
      'Crie serviços com título, descrição, fotos, preço (por hora ou empreitada) e duração. Adicione categoria e local de atendimento.',
  },
  {
    icon: CalendarRange,
    title: 'Configure sua agenda',
    description:
      'Defina seus horários disponíveis (ex: seg-sex 8h-12h e 14h-18h). Bloqueie momentos específicos para compromissos fora da plataforma.',
  },
  {
    icon: Wallet,
    title: 'Receba e saque',
    description:
      'Pagamentos liberados em até 48h após a conclusão. Solicite saque via PIX quando quiser — sem prazo mínimo, sem taxa de saque.',
  },
];

export default function ComoFuncionaPage() {
  return (
    <main>
      <PageHero
        eyebrow="Como funciona"
        title="Simples para contratar. Prático para oferecer."
        description="Conheça o passo a passo de cada lado da plataforma. A experiência foi desenhada para que tudo aconteça sem fricção, com segurança total no pagamento."
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <Tabs defaultValue="cliente" className="mx-auto max-w-5xl">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="cliente">Para clientes</TabsTrigger>
              <TabsTrigger value="profissional">Para profissionais</TabsTrigger>
            </TabsList>

            <TabsContent value="cliente" className="mt-12">
              <div className="space-y-6">
                {clientSteps.map((step, i) => (
                  <Card key={step.title} className="overflow-hidden">
                    <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start md:p-8">
                      <div className="flex shrink-0 items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zello-600 text-white shadow-lg shadow-zello-600/20">
                          <step.icon className="h-6 w-6" />
                        </div>
                        <div className="text-3xl font-bold text-zello-100 sm:text-4xl">
                          0{i + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold leading-tight">{step.title}</h3>
                        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="pt-6 text-center">
                  <Button asChild size="lg">
                    <Link href="/cadastro">
                      Criar conta de cliente
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profissional" className="mt-12">
              <div className="space-y-6">
                {proSteps.map((step, i) => (
                  <Card key={step.title} className="overflow-hidden">
                    <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start md:p-8">
                      <div className="flex shrink-0 items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zello-600 text-white shadow-lg shadow-zello-600/20">
                          <step.icon className="h-6 w-6" />
                        </div>
                        <div className="text-3xl font-bold text-zello-100 sm:text-4xl">
                          0{i + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold leading-tight">{step.title}</h3>
                        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="pt-6 text-center">
                  <Button asChild size="lg">
                    <Link href="/cadastro/profissional">
                      Cadastrar como profissional
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Como o pagamento fica protegido
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              O modelo de escrow é o coração da segurança da Zello. Veja o que acontece com o
              dinheiro em cada etapa:
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {[
              {
                step: '1.',
                title: 'Cliente paga',
                desc: 'O valor é debitado e fica retido na conta da plataforma. Profissional recebe notificação de "novo agendamento confirmado".',
              },
              {
                step: '2.',
                title: 'Serviço é executado',
                desc: 'Profissional realiza o serviço na data e local combinados. Tudo registrado no app.',
              },
              {
                step: '3.',
                title: 'Confirmação ou prazo automático',
                desc: 'Cliente clica em "Concluído" OU 48h após o término o sistema libera automaticamente. Em caso de problema, abre disputa.',
              },
              {
                step: '4.',
                title: 'Saldo disponível',
                desc: 'Valor cai na carteira do profissional como "disponível para saque". Ele solicita saque via PIX e a equipe processa.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-5 rounded-2xl border border-border bg-card p-6"
              >
                <div className="text-2xl font-bold text-zello-600">{item.step}</div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
