/**
 * Montagem do desenvolvimento do relatório "Custos & Desenvolvimento".
 *
 * O custos-data.ts é escrito à mão e a Ana lê ele cru pelo GitHub — por isso
 * ele fica como está e o que é calculado na hora mora aqui: o desenvolvimento
 * de cada mês = o que está escrito no arquivo + as tarefas que a Ana entregou
 * (mês que ainda não tem grupo escrito nasce aqui), e os pedidos pela Ana, que
 * têm fatura própria e ficam fora do mês. Função pura: a página usa e o script
 * de conferência usa a mesma.
 */
import type { EntregaDaAna } from './custosAna';
import { DEV_MONTHS, TIERS, monthLabel, tierPrice, type DevMonth, type TierKey } from './custos-data';

/**
 * Tarefas da Ana que já estavam escritas à mão no custos-data.ts antes de a
 * página perguntar pra ela (06/10/2026). Sem isso o mês contaria a mesma
 * entrega duas vezes. Daqui pra frente ninguém precisa escrever tarefa da Ana
 * no arquivo — ela chega sozinha.
 */
const JA_NO_ARQUIVO: Record<string, string> = {
  // commit 1b7b78d (conector de consulta da Ana) = "19/08 · Assistente consulta
  // a plataforma ao vivo", registrada na auditoria de 02/09
  'tarefa:49': '19/08 · Assistente consulta a plataforma ao vivo',
};

/** Uma linha do desenvolvimento, venha do arquivo ou da Ana. */
export interface DevRow {
  /** chave do ✓ (as do arquivo seguem `${key}:${índice}`, como sempre foram) */
  pk: string;
  /** "dd/mm" */
  date: string;
  title: string;
  description: string;
  tier: TierKey;
  /** R$ — tier + margem da casa por competência */
  value: number;
  /** milhões de tokens */
  tokens: number;
  /** veio da Ana (tarefa do Terminal com commit publicado) */
  ana?: boolean;
}

export interface DevGroup {
  key: string;
  ym: string;
  label: string;
  rows: DevRow[];
  /** o mês não está escrito no arquivo: nasceu das tarefas da Ana */
  generated?: boolean;
}

export interface AnaOrder {
  ref: string;
  num: string;
  date: string;
  title: string;
  description: string;
  who: string | null;
  /** R$ — valor da fatura, já com a margem */
  value: number;
  tokens: number;
  paid: boolean;
}

export interface OrderGroup {
  ym: string;
  label: string;
  rows: AnaOrder[];
}

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const dayOf = (d: string) => Number(d.slice(0, 2)) || 0;

/** O desenvolvimento como a página mostra — e como a Ana cobra: tarefa da Ana
 *  pelo mesmo tier (e a mesma margem) de uma sessão escrita, no mês dela. */
export function buildDev(
  entregas: EntregaDaAna[],
  devMonths: DevMonth[] = DEV_MONTHS,
): { groups: DevGroup[]; orders: OrderGroup[] } {
  const byYm = new Map<string, DevGroup>();
  const groups: DevGroup[] = devMonths.map((m) => {
    const g: DevGroup = {
      key: m.key,
      ym: m.ym,
      label: m.label,
      rows: m.entries.map((e, i) => ({
        pk: `${m.key}:${i}`,
        date: e.date,
        title: e.title,
        description: e.description,
        tier: e.tier,
        value: tierPrice(m.ym, e.tier),
        tokens: TIERS[e.tier].tokens,
      })),
    };
    byYm.set(m.ym, g);
    return g;
  });

  const ordersByYm = new Map<string, OrderGroup>();
  const withAna = new Set<DevGroup>();

  for (const e of entregas) {
    const ym = String(e.dia ?? '').slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(ym)) continue;

    if (e.tipo === 'tarefa') {
      if (JA_NO_ARQUIVO[e.ref]) continue;
      let g = byYm.get(ym);
      if (!g) {
        g = { key: `CX_DEV_${ym.slice(5, 7)}`, ym, label: monthLabel(ym), rows: [], generated: true };
        byYm.set(ym, g);
        groups.push(g);
      }
      const tier: TierKey = e.tier in TIERS ? e.tier : 'P';
      g.rows.push({
        pk: `${g.key}:ana:${e.ref}`,
        date: ddmm(e.dia),
        title: e.titulo,
        description: e.descricao ?? '',
        tier,
        value: tierPrice(ym, tier),
        tokens: TIERS[tier].tokens,
        ana: true,
      });
      withAna.add(g);
    } else if (e.tipo === 'pedido') {
      const o = ordersByYm.get(ym) ?? { ym, label: monthLabel(ym), rows: [] };
      ordersByYm.set(ym, o);
      o.rows.push({
        ref: e.ref,
        num: String(e.ref).split(':')[1] ?? '',
        date: ddmm(e.dia),
        title: e.titulo,
        description: e.descricao ?? '',
        who: e.quem ?? null,
        value: Math.round(Number(e.valor_centavos ?? 0)) / 100,
        tokens: Number(e.tokens_milhoes ?? 0),
        paid: Boolean(e.pago),
      });
    }
  }

  /* com entrega da Ana no meio, o mês fica em ordem de data (mais nova em cima) */
  withAna.forEach((g) => g.rows.sort((a, b) => dayOf(b.date) - dayOf(a.date)));
  ordersByYm.forEach((o) => o.rows.sort((a, b) => dayOf(b.date) - dayOf(a.date)));

  return {
    groups: groups.sort((a, b) => b.ym.localeCompare(a.ym)),
    orders: [...ordersByYm.values()].sort((a, b) => b.ym.localeCompare(a.ym)),
  };
}

/** Soma em reais sem a sujeira do ponto flutuante (vai ao centavo). */
export const sumValue = (rows: { value: number }[]) =>
  Math.round(rows.reduce((s, r) => s + r.value * 100, 0)) / 100;
