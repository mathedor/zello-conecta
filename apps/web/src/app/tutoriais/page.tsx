import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, PlayCircle, Sparkles } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Tutoriais',
  description:
    'Aprenda a usar a Zello Conecta passo a passo. Tutoriais para clientes e profissionais sobre cadastro, agendamento, pagamento e muito mais.',
};

const tutorials = [
  {
    audience: 'Cliente',
    title: 'Como contratar seu primeiro serviço',
    description: 'Da busca à confirmação: 4 passos para contratar um profissional verificado.',
    duration: '3 min',
    type: 'video' as const,
  },
  {
    audience: 'Cliente',
    title: 'Como funciona o pagamento retido',
    description: 'Entenda como seu dinheiro fica seguro até o serviço ser concluído.',
    duration: '2 min',
    type: 'texto' as const,
  },
  {
    audience: 'Cliente',
    title: 'O que fazer se algo der errado',
    description: 'Como abrir uma disputa, prazos e o que esperar da equipe de suporte.',
    duration: '3 min',
    type: 'texto' as const,
  },
  {
    audience: 'Profissional',
    title: 'Cadastro completo: do zero ao primeiro cliente',
    description: 'Passo a passo do cadastro, KYC, configuração de serviços e agenda.',
    duration: '5 min',
    type: 'video' as const,
  },
  {
    audience: 'Profissional',
    title: 'Como configurar sua agenda perfeitamente',
    description: 'Horários recorrentes, bloqueios, integração Google Calendar e iCal.',
    duration: '4 min',
    type: 'video' as const,
  },
  {
    audience: 'Profissional',
    title: 'Solicitando seu primeiro saque via PIX',
    description: 'Quando o saldo libera, como pedir saque e prazo de processamento.',
    duration: '2 min',
    type: 'texto' as const,
  },
];

export default function TutoriaisPage() {
  return (
    <main>
      <PageHero
        eyebrow="Aprenda a usar"
        title="Tutoriais"
        description="Vídeos curtos e guias práticos para você dominar a Zello Conecta. Selecione o conteúdo conforme seu perfil."
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((t) => (
              <Card
                key={t.title}
                className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:border-zello-200 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Badge variant="soft">{t.audience}</Badge>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {t.type === 'video' ? (
                        <PlayCircle className="h-4 w-4" />
                      ) : (
                        <BookOpen className="h-4 w-4" />
                      )}
                      <span>{t.duration}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.description}
                  </p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-zello-600 group-hover:gap-3 transition-all">
                    <span>Ler tutorial</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-border bg-secondary/30 p-8 text-center md:p-12">
            <Sparkles className="mx-auto h-10 w-10 text-zello-600" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
              Conteúdo em construção
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              Estamos produzindo vídeos e guias detalhados. Quer ser avisado quando os primeiros
              tutoriais saírem? Cadastre-se e receba por email.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/cadastro">
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
