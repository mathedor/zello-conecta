import Link from 'next/link';
import { ArrowRight, BarChart3, CalendarRange, Star, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  { icon: CalendarRange, title: 'Agenda inteligente', desc: 'Sincroniza com Google Calendar e iCal. Bloqueios pontuais para compromissos fora da plataforma.' },
  { icon: Wallet, title: 'Carteira digital', desc: 'Acompanhe pagamentos retidos, disponíveis e ganhos totais. Saque via PIX sob demanda.' },
  { icon: Star, title: 'Reputação que cresce', desc: 'Cada serviço bem feito é uma avaliação que aparece no seu perfil para futuros clientes.' },
  { icon: BarChart3, title: 'Relatórios e analytics', desc: 'Veja serviços prestados, clientes atendidos, faturamento mensal e métricas de desempenho.' },
];

export function ForProfessionalsSection() {
  return (
    <section className="bg-zello-950 py-20 text-white md:py-28">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-zello-300">
              Para profissionais
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Sua agenda cheia, sem dor de cabeça.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zello-100 sm:text-lg">
              Cadastre seus serviços, defina sua disponibilidade e deixe a Zello cuidar do resto.
              Receba pagamentos, gerencie clientes e construa sua reputação.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zello-500/20 text-zello-300">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{b.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-zello-200">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" className="w-full bg-white text-zello-900 hover:bg-zello-50 sm:w-auto">
                <Link href="/cadastro/profissional">
                  Cadastre-se grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="xl"
                className="w-full text-white hover:bg-white/10 sm:w-auto"
              >
                <Link href="/como-funciona">Ver como funciona</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-zello-500/30 via-zello-400/20 to-transparent blur-2xl" />
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zello-900 to-zello-800 p-8 shadow-2xl backdrop-blur-md">
              <div className="text-xs font-semibold uppercase tracking-wider text-zello-300">
                Modelo transparente
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-7xl font-bold tracking-tight">20%</span>
                <span className="text-xl text-zello-200">por venda</span>
              </div>
              <p className="mt-2 text-sm text-zello-200">
                Sem mensalidade. Sem taxa de cadastro. Você só paga quando vende.
              </p>

              <div className="my-8 h-px bg-white/10" />

              <ul className="space-y-3 text-sm">
                {[
                  'Cadastro 100% gratuito',
                  'Cobrança via cartão ou PIX',
                  'Saldo disponível em até 48h',
                  'Saque via PIX quando quiser',
                  'Suporte dedicado para disputas',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zello-500 text-[10px] font-bold text-white">
                      ✓
                    </span>
                    <span className="text-zello-100">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wider text-zello-300">Exemplo</div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-zello-200">Serviço de R$ 200,00</span>
                  <span className="font-semibold">Você recebe R$ 160,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
