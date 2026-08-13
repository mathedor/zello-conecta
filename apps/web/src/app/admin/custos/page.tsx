import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { contasDaAna, comValorDaAna } from '@/lib/custosAna';
import { MONTHLY_ITEMS } from '@/lib/custos-data';
import { CustosClient } from './custos-client';

export const metadata = { title: 'Custos & Desenvolvimento' };
export const dynamic = 'force-dynamic';

export default async function CustosPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  // Mês corrente calculado no servidor (fuso de Brasília) para não haver
  // divergência entre o HTML gerado e o que o navegador renderiza.
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
  );
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // o preço de verdade da infraestrutura deste mês, lido pela Ana na fatura
  const daAna = await contasDaAna('zello');
  const items = comValorDaAna(
    MONTHLY_ITEMS.map((i) => ({ ...i, nome: i.label, valor: i.value, obs: i.note, estimado: i.estimated })),
    daAna,
  ).map((i) => ({ ...i, value: i.valor, note: i.obs ?? i.note, estimated: i.estimado }));

  return (
    <DashboardShell
      title="Custos & Desenvolvimento"
      description="Quanto a Zello Conecta custou para existir, quanto custa por mês para ficar no ar e tudo que foi entregue desde a primeira versão."
    >
      <CustosClient currentMonth={currentMonth} items={items} />
    </DashboardShell>
  );
}
