import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Briefcase, LayoutGrid, MapPin, Map, Tag, UsersRound } from 'lucide-react';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Relatórios' };

const REPORTS = [
  {
    href: '/admin/relatorios/usuarios',
    icon: UsersRound,
    title: 'Usuários',
    description: 'Ranking dos clientes que mais contrataram serviços (volume e valor).',
  },
  {
    href: '/admin/relatorios/profissionais',
    icon: Briefcase,
    title: 'Profissionais',
    description: 'Ranking dos profissionais que mais venderam (volume, valor e líquido).',
  },
  {
    href: '/admin/relatorios/cidades',
    icon: MapPin,
    title: 'Cidades',
    description: 'Cidades com mais vendas concluídas no período.',
  },
  {
    href: '/admin/relatorios/estados',
    icon: Map,
    title: 'Estados',
    description: 'Distribuição de vendas por UF.',
  },
  {
    href: '/admin/relatorios/servicos',
    icon: LayoutGrid,
    title: 'Serviços',
    description: 'Serviços individuais mais contratados (com link para todas as compras).',
  },
  {
    href: '/admin/relatorios/categorias',
    icon: Tag,
    title: 'Categorias',
    description: 'Performance por categoria de profissional.',
  },
];

export default async function RelatoriosIndex() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  return (
    <DashboardShell
      title="Relatórios"
      description="Análises agregadas com filtro de data, ordenação e totais. Clique para abrir."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-zello-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zello-50 text-zello-600 transition-colors group-hover:bg-zello-600 group-hover:text-white">
              <r.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{r.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zello-600 group-hover:gap-2 transition-all">
              Abrir relatório <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
