import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Como faço para contratar um serviço?',
    a: 'Faça uma busca por categoria ou nome do serviço, escolha o profissional, selecione um horário disponível na agenda dele e finalize o pagamento. Em segundos você recebe a confirmação por email e pelo app.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Pague com cartão de crédito (via Stripe) ou PIX (via Efí). O valor fica retido pela Zello até você confirmar que o serviço foi concluído ou até passarem 48h após o término previsto. Só então o pagamento é liberado para o profissional.',
  },
  {
    q: 'Os profissionais são verificados?',
    a: 'Sim. Todo profissional passa por verificação de identidade obrigatória (KYC) com CPF e documento antes de ter o perfil aprovado. Além disso, as avaliações dos clientes anteriores ficam visíveis no perfil.',
  },
  {
    q: 'E se eu tiver um problema com o serviço?',
    a: 'Você pode abrir uma disputa em até 48h após o término previsto. Nossa equipe medeia a resolução: o pagamento fica suspenso, ouvimos as duas partes e decidimos por reembolso, refazimento ou liberação. Suporte dedicado em todos os casos.',
  },
  {
    q: 'Quero ser um profissional na plataforma. Como faço?',
    a: 'Cadastro gratuito em poucos minutos: preencha seus dados, envie documentos para verificação, configure seus serviços (preço por hora ou por empreitada), defina sua agenda e pronto — você já pode receber clientes.',
  },
  {
    q: 'Quanto a Zello cobra?',
    a: 'Cobramos 20% sobre cada venda concluída. Sem mensalidade, sem taxa de cadastro, sem custo escondido. Você só paga quando vende. Por exemplo: serviço de R$ 200 → você recebe R$ 160 líquidos.',
  },
  {
    q: 'Posso usar o serviço fora da minha cidade?',
    a: 'Sim. A busca permite filtrar por cidade, CEP e raio em km. Profissionais que aceitam atender em local do cliente podem cobrar adicional de deslocamento, sempre transparente antes da contratação.',
  },
  {
    q: 'Quando vou poder usar pelo celular?',
    a: 'A versão web mobile já funciona perfeitamente. Os apps nativos para iOS e Android estão em desenvolvimento e serão publicados nas lojas em breve.',
  },
];

export function FaqSection() {
  return (
    <section className="border-t border-border/60 py-20 md:py-28">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-zello-600">
              Perguntas frequentes
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Tire suas dúvidas
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              As perguntas mais comuns sobre como contratar, pagar, ser profissional e o que
              acontece em caso de problema.
            </p>
          </div>
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
