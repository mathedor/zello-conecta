import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { Logo } from './logo';

const footerSections = [
  {
    title: 'Plataforma',
    links: [
      { href: '/como-funciona', label: 'Como funciona' },
      { href: '/buscar', label: 'Buscar serviços' },
      { href: '/cadastro/profissional', label: 'Para profissionais' },
      { href: '/tutoriais', label: 'Tutoriais' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { href: '/quem-somos', label: 'Quem somos' },
      { href: '/contato', label: 'Contato' },
      { href: '/quem-somos#modelo', label: 'Modelo de negócio' },
      { href: '/quem-somos#carreiras', label: 'Carreiras' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/termos', label: 'Termos de uso' },
      { href: '/privacidade', label: 'Privacidade (LGPD)' },
      { href: '/seguranca', label: 'Segurança' },
      { href: '/cookies', label: 'Política de cookies' },
    ],
  },
];

const social = [
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
  { href: 'mailto:contato@zelloconecta.com.br', icon: Mail, label: 'Email' },
  { href: 'https://wa.me/5500000000000', icon: MessageCircle, label: 'WhatsApp' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo size="md" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Marketplace de serviços profissionais. Encontre, agende e pague — tudo num só lugar,
              com pagamento seguro retido até a conclusão do serviço.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-colors hover:border-zello-200 hover:bg-zello-50 hover:text-zello-700"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold tracking-wide text-foreground">
                  {section.title}
                </h4>
                <ul className="mt-4 space-y-3 text-sm">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Zello Conecta. Todos os direitos reservados. CNPJ em
            constituição.
          </p>
          <p className="text-xs text-muted-foreground">
            Em breve nas lojas <span className="font-medium">iOS</span> e{' '}
            <span className="font-medium">Android</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
