import Link from 'next/link';
import { ArrowRight, Calendar, Search, Shield, Smartphone, Star, Wallet } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zello-600 text-white font-bold">
              Z
            </div>
            <span className="text-lg font-semibold tracking-tight">Zello Conecta</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground">
              Como funciona
            </Link>
            <Link href="#quem-somos" className="text-sm text-muted-foreground hover:text-foreground">
              Quem somos
            </Link>
            <Link href="#contato" className="text-sm text-muted-foreground hover:text-foreground">
              Contato
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/entrar"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary md:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 rounded-lg bg-zello-600 px-4 py-2 text-sm font-medium text-white hover:bg-zello-700"
            >
              Começar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zello-50 via-background to-background" />
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-zello-500" />
              <span className="text-muted-foreground">Em breve nas lojas iOS e Android</span>
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-7xl">
              O serviço certo,{' '}
              <span className="bg-gradient-to-r from-zello-600 to-zello-400 bg-clip-text text-transparent">
                na hora certa
              </span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              Encontre profissionais de qualquer setor, agende com poucos cliques e pague com
              segurança. Tudo num só lugar.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/buscar"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zello-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-zello-600/20 transition hover:bg-zello-700 sm:w-auto"
              >
                <Search className="h-5 w-5" />
                Buscar profissionais
              </Link>
              <Link
                href="/cadastro/profissional"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-base font-medium hover:bg-secondary sm:w-auto"
              >
                Sou profissional
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-t border-border/60 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight">Como funciona</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simples para quem contrata, prático para quem oferece.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: '1. Encontre',
                desc: 'Busque por categoria, cidade ou tipo de serviço. Veja avaliações reais e disponibilidade.',
              },
              {
                icon: Calendar,
                title: '2. Agende',
                desc: 'Escolha um horário livre na agenda do profissional e reserve em segundos.',
              },
              {
                icon: Shield,
                title: '3. Pague com segurança',
                desc: 'Pague com cartão ou PIX. O valor fica retido até o serviço ser concluído.',
              },
            ].map((step) => (
              <div
                key={step.title}
                className="group rounded-2xl border border-border bg-card p-8 transition hover:border-zello-500/40 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zello-50 text-zello-600 group-hover:bg-zello-600 group-hover:text-white transition">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-20">
        <div className="container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Para profissionais</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Construa sua agenda, gerencie clientes e receba pagamentos sem complicação.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: Calendar, text: 'Agenda inteligente sincronizada com Google e iCal' },
                  { icon: Wallet, text: 'Carteira digital com saque sob demanda via PIX' },
                  { icon: Star, text: 'Sistema de avaliações que constrói sua reputação' },
                  { icon: Smartphone, text: 'App nativo iOS e Android para gerenciar tudo no celular' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zello-100 text-zello-600">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/cadastro/profissional"
                className="mt-10 inline-flex items-center gap-2 rounded-xl bg-zello-600 px-6 py-3 font-medium text-white hover:bg-zello-700"
              >
                Cadastre-se grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
              <div className="text-sm text-muted-foreground">Modelo transparente</div>
              <div className="mt-2 text-5xl font-bold">20%</div>
              <div className="text-lg text-muted-foreground">de taxa por venda</div>
              <div className="my-6 h-px bg-border" />
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Sem mensalidade</span>
                  <span className="font-medium text-zello-600">✓</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Sem taxa de cadastro</span>
                  <span className="font-medium text-zello-600">✓</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Pagamento seguro retido</span>
                  <span className="font-medium text-zello-600">✓</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Saque via PIX</span>
                  <span className="font-medium text-zello-600">✓</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="quem-somos" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight">Quem somos</h2>
            <p className="mt-6 text-lg text-muted-foreground">
              A Zello Conecta nasceu para resolver um problema simples: contratar um profissional
              de confiança não deveria ser difícil. Conectamos pessoas que precisam de serviços a
              profissionais qualificados, com agendamento integrado, pagamento seguro e suporte
              completo.
            </p>
          </div>
        </div>
      </section>

      <footer id="contato" className="border-t border-border bg-card">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zello-600 text-white font-bold text-sm">
                  Z
                </div>
                <span className="font-semibold">Zello Conecta</span>
              </div>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                Marketplace de serviços profissionais. Encontre, agende e pague — tudo num só
                lugar.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Plataforma</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#como-funciona" className="hover:text-foreground">Como funciona</Link></li>
                <li><Link href="/buscar" className="hover:text-foreground">Buscar serviços</Link></li>
                <li><Link href="/cadastro/profissional" className="hover:text-foreground">Para profissionais</Link></li>
                <li><Link href="/tutoriais" className="hover:text-foreground">Tutoriais</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/termos" className="hover:text-foreground">Termos de uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-foreground">Privacidade</Link></li>
                <li><Link href="/seguranca" className="hover:text-foreground">Segurança</Link></li>
                <li><Link href="/contato" className="hover:text-foreground">Contato</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Zello Conecta. Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Em breve nas lojas iOS e Android
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
