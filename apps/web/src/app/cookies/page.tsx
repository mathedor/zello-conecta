import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { LegalProse } from '@/components/layout/legal-prose';

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Como a Zello Conecta usa cookies e tecnologias similares.',
};

export default function CookiesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Política de cookies"
        description="Última atualização: 6 de maio de 2026."
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <LegalProse>
            <h2>O que são cookies</h2>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu navegador quando você
              acessa um site. Eles permitem reconhecer você em visitas futuras, manter você logado,
              lembrar preferências e medir o uso do site.
            </p>

            <h2>Quais cookies usamos</h2>
            <h3>Essenciais (sempre ativos)</h3>
            <ul>
              <li><strong>Sessão</strong>: mantém você autenticado durante o uso da plataforma</li>
              <li><strong>CSRF token</strong>: proteção contra ataques de falsificação de requisição</li>
              <li><strong>Preferências de cookie</strong>: lembra sua escolha sobre cookies não-essenciais</li>
            </ul>

            <h3>Analíticos (opcionais)</h3>
            <ul>
              <li>
                Métricas de uso anonimizadas (páginas visitadas, tempo na página, fluxo de navegação)
              </li>
              <li>Ajudam a entender o que funciona e o que precisa melhorar na plataforma</li>
            </ul>

            <h3>Marketing (opcionais)</h3>
            <ul>
              <li>Não usamos cookies de marketing de terceiros no momento.</li>
            </ul>

            <h2>Como gerenciar cookies</h2>
            <p>
              Você pode aceitar ou recusar cookies não-essenciais ao acessar a plataforma pela
              primeira vez. Pode mudar sua escolha a qualquer momento nas configurações do app.
              Cookies essenciais não podem ser desativados, pois sem eles a plataforma não
              funciona.
            </p>
            <p>Você também pode bloquear cookies diretamente no seu navegador:</p>
            <ul>
              <li>Chrome: Configurações → Privacidade e segurança → Cookies</li>
              <li>Safari: Preferências → Privacidade</li>
              <li>Firefox: Preferências → Privacidade e Segurança</li>
            </ul>

            <h2>Atualizações</h2>
            <p>
              Esta política pode ser atualizada. Mudanças relevantes serão comunicadas por aviso na
              plataforma.
            </p>

            <h2>Contato</h2>
            <p>
              Dúvidas sobre cookies:{' '}
              <a href="mailto:dpo@zelloconecta.com.br">dpo@zelloconecta.com.br</a>.
            </p>
          </LegalProse>
        </div>
      </section>
    </main>
  );
}
