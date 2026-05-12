import Link from 'next/link';
import { ArrowRight, Calendar, History, Search, Star } from 'lucide-react';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Meu painel' };

export default async function PainelPage() {
  const session = await auth();
  const firstName = session?.user.name?.split(' ')[0] ?? 'cliente';

  return (
    <DashboardShell
      title={`Olá, ${firstName} 👋`}
      description="Aqui você acompanha suas contratações, agendamentos e avaliações."
      actions={
        <Button asChild>
          <Link href="/">
            <Search className="h-4 w-4" />
            Buscar profissionais
          </Link>
        </Button>
      }
    >
      <div className="grid gap-5 md:grid-cols-3">
        {[
          { icon: Calendar, label: 'Próximas reservas', value: '0', href: '/painel/agendamentos' },
          { icon: History, label: 'Serviços contratados', value: '0', href: '/painel/historico' },
          { icon: Star, label: 'Avaliações dadas', value: '0', href: '/painel/avaliacoes' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <s.icon className="h-5 w-5 text-zello-600" />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              <div className="mt-3 text-3xl font-bold">{s.value}</div>
              <Link
                href={s.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zello-600 hover:gap-2 transition-all"
              >
                Ver tudo <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center md:p-16">
          <Search className="h-12 w-12 text-zello-600" />
          <h2 className="text-xl font-semibold">Encontre o profissional ideal</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Você ainda não tem reservas. Comece buscando por categoria ou serviço — pagamento
            seguro com retenção até a conclusão.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/">Explorar serviços</Link>
          </Button>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
