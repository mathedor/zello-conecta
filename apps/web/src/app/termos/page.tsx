import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { LegalProse } from '@/components/layout/legal-prose';

export const metadata: Metadata = {
  title: 'Termos de uso',
  description: 'Termos e condições de uso da plataforma Zello Conecta.',
};

export default function TermosPage() {
  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Termos de uso"
        description="Última atualização: 6 de maio de 2026."
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <LegalProse>
            <h2>1. Aceitação dos termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma Zello Conecta (o "Serviço"), você concorda em
              cumprir e ficar vinculado a estes Termos de Uso. Se você não concorda com qualquer
              parte destes termos, não utilize a plataforma.
            </p>

            <h2>2. Definições</h2>
            <ul>
              <li><strong>Zello Conecta</strong>: plataforma marketplace que conecta clientes a profissionais para contratação de serviços.</li>
              <li><strong>Cliente</strong>: usuário que contrata serviços através da plataforma.</li>
              <li><strong>Profissional</strong>: usuário que oferece e presta serviços através da plataforma.</li>
              <li><strong>Serviço</strong>: trabalho oferecido pelo Profissional, contratado pelo Cliente.</li>
              <li><strong>Taxa Zello</strong>: 20% sobre o valor de cada venda concluída, retida pela plataforma.</li>
            </ul>

            <h2>3. Cadastro e uso da conta</h2>
            <p>
              Para utilizar a plataforma, é necessário cadastro com informações verdadeiras e
              atualizadas. Profissionais devem completar verificação de identidade (KYC) com envio
              de documento de identidade e selfie. Você é responsável por manter suas credenciais
              em segurança.
            </p>

            <h2>4. Modelo de cobrança</h2>
            <p>
              A Zello cobra <strong>20% sobre cada venda</strong> concluída. Não há mensalidade,
              taxa de adesão ou custo de manutenção da conta. O cadastro de Profissionais e
              Clientes é gratuito.
            </p>

            <h2>5. Pagamentos e escrow</h2>
            <p>
              Os pagamentos são processados via parceiros (Stripe para cartão, Efí para PIX). O
              valor pago pelo Cliente fica retido pela Zello até a conclusão do serviço. A liberação
              do pagamento ao Profissional ocorre:
            </p>
            <ul>
              <li>Quando o Cliente confirma a conclusão do serviço; ou</li>
              <li>Automaticamente 48 horas após o término previsto, se não houver disputa aberta.</li>
            </ul>

            <h2>6. Disputas</h2>
            <p>
              Em caso de problema com o serviço, o Cliente pode abrir uma disputa em até 48 horas
              após o término previsto. Durante a análise, o pagamento permanece retido. A equipe da
              Zello mediará a resolução, podendo determinar reembolso, refazimento do serviço ou
              liberação do pagamento ao Profissional.
            </p>

            <h2>7. Saques</h2>
            <p>
              Profissionais podem solicitar saque do saldo disponível a qualquer momento, via PIX.
              A solicitação gera um ticket processado manualmente pela equipe da Zello em até 2 dias
              úteis. Não há taxa de saque.
            </p>

            <h2>8. Responsabilidades das partes</h2>
            <p>
              <strong>Profissional</strong>: responsável pela qualidade, prazo e legalidade do
              serviço prestado.
              <br />
              <strong>Cliente</strong>: responsável por informações precisas sobre o serviço
              solicitado e pelo pagamento.
              <br />
              <strong>Zello</strong>: intermediária e responsável pelo pagamento seguro, agenda e
              suporte.
            </p>

            <h2>9. Conduta proibida</h2>
            <ul>
              <li>Cadastrar informações falsas ou identidade de terceiros</li>
              <li>Tentar fechar serviços fora da plataforma para burlar a taxa</li>
              <li>Praticar fraude, discriminação, assédio ou crime</li>
              <li>Utilizar a plataforma para serviços ilegais</li>
            </ul>

            <h2>10. Suspensão e encerramento</h2>
            <p>
              A Zello pode suspender ou encerrar contas que violem estes termos, sem aviso prévio,
              especialmente em casos de fraude, fuga de plataforma ou prática ilegal.
            </p>

            <h2>11. Propriedade intelectual</h2>
            <p>
              Todo o conteúdo da plataforma (marca, design, código, textos) é propriedade da Zello
              Conecta. Avaliações, fotos e descrições enviadas por Usuários permanecem dos autores,
              mas concedem licença não-exclusiva para uso na plataforma.
            </p>

            <h2>12. Limitação de responsabilidade</h2>
            <p>
              A Zello atua como intermediária. Não nos responsabilizamos por danos decorrentes da
              execução dos serviços, embora ofereçamos sistema de disputas e mediação.
            </p>

            <h2>13. Alterações destes termos</h2>
            <p>
              Podemos atualizar estes termos. Mudanças relevantes serão comunicadas por email com
              30 dias de antecedência. O uso continuado após a notificação implica aceitação.
            </p>

            <h2>14. Lei aplicável e foro</h2>
            <p>
              Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca da
              sede da Zello Conecta para resolução de qualquer controvérsia.
            </p>

            <h2>15. Contato</h2>
            <p>
              Dúvidas sobre estes termos: <a href="/contato">página de contato</a> ou{' '}
              <a href="mailto:juridico@zelloconecta.com.br">juridico@zelloconecta.com.br</a>.
            </p>
          </LegalProse>
        </div>
      </section>
    </main>
  );
}
