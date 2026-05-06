import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CalendarRange,
  CheckCircle2,
  Search,
  Shield,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import { Logo } from '@/components/layout/logo';

export const metadata: Metadata = {
  title: 'Criar conta',
  description:
    'Escolha seu perfil para cadastrar — cliente que quer contratar serviços ou profissional que oferece serviços.',
};

const PROFILES = [
  {
    href: '/cadastro/cliente',
    icon: ShoppingBag,
    badge: 'Para clientes',
    title: 'Quero contratar',
    subtitle: 'Encontrar e contratar profissionais',
    description:
      'Crie sua conta gratuita para buscar profissionais verificados, agendar serviços e pagar com segurança.',
    bullets: [
      { icon: Search, text: 'Buscar por categoria, cidade ou nome' },
      { icon: CalendarRange, text: 'Agendar em segundos' },
      { icon: Shield, text: 'Pagamento retido até a conclusão' },
    ],
    cta: 'Cadastro de cliente',
  },
  {
    href: '/cadastro/profissional/wizard',
    icon: Briefcase,
    badge: 'Para profissionais',
    title: 'Quero oferecer',
    subtitle: 'Cadastrar meus serviços e receber clientes',
    description:
      'Crie seu perfil profissional, configure serviços e agenda. Sem mensalidade — só 20% por venda.',
    bullets: [
      { icon: Wallet, text: 'Sem mensalidade · 20% por venda' },
      { icon: CalendarRange, text: 'Agenda integrada (Google + iCal)' },
      { icon: CheckCircle2, text: 'Reputação com avaliações reais' },
    ],
    cta: 'Cadastro de profissional',
  },
];

export default function CadastroEscolhaPage() {
  return (
    <main className="container py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex justify-center sm:hidden">
          <Logo size="md" />
        </div>

        <div className="text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Como você quer usar a Zello?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
            Escolha seu perfil para começar. O cadastro é gratuito nos dois lados.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PROFILES.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.href}
                href={p.href}
                className="group relative flex flex-col rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-zello-300 hover:shadow-lg md:p-8"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zello-50 text-zello-600 transition-colors group-hover:bg-zello-600 group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>

                <span className="inline-block w-fit rounded-full bg-zello-50 px-3 py-1 text-xs font-medium text-zello-700">
                  {p.badge}
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight">{p.title}</h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{p.subtitle}</p>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>

                <ul className="mt-5 space-y-2">
                  {p.bullets.map((b, i) => {
                    const BIcon = b.icon;
                    return (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <BIcon className="h-4 w-4 shrink-0 text-zello-600" />
                        <span>{b.text}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-auto pt-6">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-zello-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all group-hover:gap-2.5 group-hover:bg-zello-700">
                    {p.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/entrar" className="font-medium text-zello-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
