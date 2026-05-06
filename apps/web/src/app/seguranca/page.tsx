import type { Metadata } from 'next';
import { CreditCard, FileCheck, Lock, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Segurança',
  description:
    'Como a Zello Conecta protege clientes e profissionais: pagamento em escrow, KYC, criptografia, sistema de disputas.',
};

const layers = [
  {
    icon: ShieldCheck,
    title: 'Pagamento em escrow',
    desc: 'O valor pago fica retido pela plataforma e só é liberado ao profissional após a conclusão do serviço (confirmação do cliente ou prazo automático de 48h).',
  },
  {
    icon: UserCheck,
    title: 'Verificação de identidade (KYC)',
    desc: 'Todo profissional precisa enviar documento e selfie para aprovação manual antes de aparecer nas buscas. Reduz fraude e dá confiança ao contratante.',
  },
  {
    icon: CreditCard,
    title: 'Parceiros certificados',
    desc: 'Pagamentos processados pela Stripe (PCI-DSS Level 1) e Efí (Banco Central). Não armazenamos dados completos do cartão.',
  },
  {
    icon: Lock,
    title: 'Criptografia em trânsito',
    desc: 'Toda comunicação com a plataforma é via HTTPS/TLS 1.3. Senhas armazenadas com hash bcrypt. Tokens com rotação periódica.',
  },
  {
    icon: AlertTriangle,
    title: 'Sistema de disputas',
    desc: 'Se algo der errado, abra disputa em até 48h. Pagamento fica suspenso, equipe medeia entre as partes e decide por reembolso, refazimento ou liberação.',
  },
  {
    icon: FileCheck,
    title: 'Auditoria e logs',
    desc: 'Cada ação relevante (login, agendamento, pagamento, saque) é registrada com IP e timestamp. Permite investigação rápida em caso de incidente.',
  },
];

export default function SegurancaPage() {
  return (
    <main>
      <PageHero
        eyebrow="Segurança"
        title="Várias camadas de proteção"
        description="Construímos a Zello Conecta com segurança em cada decisão de produto. Aqui está exatamente como protegemos clientes, profissionais e seus dados."
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {layers.map((l) => (
              <Card key={l.title} className="hover:border-zello-200 hover:shadow-md">
                <CardContent className="p-7">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zello-50 text-zello-600">
                    <l.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{l.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Reportar incidentes de segurança
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Encontrou uma vulnerabilidade ou comportamento suspeito? Agradecemos a divulgação
              responsável. Envie email para{' '}
              <a
                href="mailto:security@zelloconecta.com.br"
                className="font-medium text-zello-600 underline-offset-4 hover:underline"
              >
                security@zelloconecta.com.br
              </a>{' '}
              com detalhes técnicos. Não tente explorar a falha em produção. Comprometemo-nos a
              responder em até 72h e reconhecer publicamente pesquisadores que ajudarem a manter a
              plataforma segura.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
