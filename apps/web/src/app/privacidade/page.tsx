import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { LegalProse } from '@/components/layout/legal-prose';

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: 'Como a Zello Conecta coleta, usa e protege seus dados pessoais (LGPD).',
};

export default function PrivacidadePage() {
  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Política de privacidade"
        description="Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Última atualização: 6 de maio de 2026."
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <LegalProse>
            <h2>1. Quem somos</h2>
            <p>
              A Zello Conecta é o controlador dos seus dados pessoais para fins de LGPD. Você pode
              contatar nosso encarregado de proteção de dados (DPO) pelo email{' '}
              <a href="mailto:dpo@zelloconecta.com.br">dpo@zelloconecta.com.br</a>.
            </p>

            <h2>2. Dados que coletamos</h2>
            <h3>2.1. Cadastrais</h3>
            <ul>
              <li>Nome completo, email, telefone, CPF/CNPJ, data de nascimento</li>
              <li>Endereço (para Cliente: local de atendimento; para Profissional: área de atuação)</li>
              <li>Foto de perfil (opcional)</li>
            </ul>
            <h3>2.2. KYC (Profissionais)</h3>
            <ul>
              <li>Documento de identidade (RG/CNH)</li>
              <li>Selfie para validação</li>
              <li>Comprovante de endereço (se solicitado)</li>
            </ul>
            <h3>2.3. Financeiros</h3>
            <ul>
              <li>Dados de pagamento (processados pelos parceiros Stripe e Efí — não armazenamos dados completos do cartão)</li>
              <li>Chave PIX e dados bancários para saque (Profissionais)</li>
            </ul>
            <h3>2.4. De uso</h3>
            <ul>
              <li>Histórico de serviços contratados/prestados</li>
              <li>Avaliações enviadas e recebidas</li>
              <li>Conversas com a equipe de suporte</li>
              <li>Logs de acesso (IP, dispositivo, navegador)</li>
              <li>Geolocalização (apenas com permissão explícita)</li>
            </ul>

            <h2>3. Por que coletamos (base legal)</h2>
            <ul>
              <li><strong>Execução de contrato</strong>: prestar o serviço da plataforma</li>
              <li><strong>Obrigação legal</strong>: KYC, antifraude, registros fiscais</li>
              <li><strong>Consentimento</strong>: marketing, geolocalização, cookies não-essenciais</li>
              <li><strong>Legítimo interesse</strong>: segurança, prevenção a fraude, melhoria do produto</li>
            </ul>

            <h2>4. Com quem compartilhamos</h2>
            <ul>
              <li><strong>Outros usuários da plataforma</strong>: nome, foto, avaliações, perfil profissional (público)</li>
              <li><strong>Parceiros de pagamento</strong>: Stripe (cartão), Efí (PIX)</li>
              <li><strong>Parceiros de comunicação</strong>: Resend (email), Twilio (SMS)</li>
              <li><strong>Autoridades públicas</strong>: quando exigido por lei ou ordem judicial</li>
            </ul>
            <p>Não vendemos dados pessoais a terceiros para fins comerciais.</p>

            <h2>5. Por quanto tempo guardamos</h2>
            <ul>
              <li>Dados cadastrais: enquanto a conta estiver ativa + 5 anos após o encerramento (obrigação legal)</li>
              <li>Dados de pagamento: 5 anos (obrigação fiscal)</li>
              <li>Logs de acesso: 6 meses (Marco Civil da Internet)</li>
              <li>KYC: enquanto a conta estiver ativa + 5 anos (antifraude)</li>
            </ul>

            <h2>6. Seus direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul>
              <li>Confirmação da existência de tratamento</li>
              <li>Acesso aos dados</li>
              <li>Correção de dados incompletos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade</li>
              <li>Eliminação dos dados tratados com consentimento</li>
              <li>Informação sobre compartilhamento</li>
              <li>Revogação do consentimento</li>
              <li>Revisão de decisões automatizadas</li>
            </ul>
            <p>
              Para exercer qualquer direito, envie email para{' '}
              <a href="mailto:dpo@zelloconecta.com.br">dpo@zelloconecta.com.br</a> ou use a área
              "Privacidade" dentro do app.
            </p>

            <h2>7. Segurança</h2>
            <p>
              Aplicamos medidas técnicas e organizacionais para proteger seus dados: criptografia em
              trânsito (HTTPS/TLS), senhas com hash, controle de acesso, monitoramento de acesso a
              dados sensíveis, parceiros certificados (PCI-DSS para pagamentos).
            </p>

            <h2>8. Cookies</h2>
            <p>
              Veja nossa <a href="/cookies">Política de Cookies</a> para detalhes sobre quais
              cookies usamos e como gerenciá-los.
            </p>

            <h2>9. Alterações desta política</h2>
            <p>
              Podemos atualizar esta política. Mudanças relevantes serão comunicadas por email e
              aviso na plataforma com 30 dias de antecedência.
            </p>

            <h2>10. Contato</h2>
            <p>
              Encarregado de Proteção de Dados (DPO):{' '}
              <a href="mailto:dpo@zelloconecta.com.br">dpo@zelloconecta.com.br</a>
              <br />
              Suporte geral: <a href="/contato">página de contato</a>
              <br />
              Autoridade Nacional de Proteção de Dados (ANPD):{' '}
              <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
                gov.br/anpd
              </a>
            </p>
          </LegalProse>
        </div>
      </section>
    </main>
  );
}
