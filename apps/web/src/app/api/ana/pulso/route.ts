import { NextResponse } from "next/server";
import { prisma } from "@zello/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Nomes reais dos papéis do Zello Conecta no pulso. */
const NIVEL: Record<string, string> = {
  CLIENT: "cliente",
  PROFESSIONAL: "prestador",
  ADMIN: "admin",
};

/** Início de "hoje" em America/Sao_Paulo (UTC-3 fixo, sem DST no Brasil). */
function inicioHojeSP(): Date {
  const [y = 1970, m = 1, d = 1] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" })
    .format(new Date())
    .split("-")
    .map(Number);
  return new Date(Date.UTC(y, m - 1, d, 3, 0, 0));
}

/** Conector da Ana — Pulso v2 · GET /api/ana/pulso · Authorization: Bearer ANA_PULSO_TOKEN */
export async function GET(req: Request) {
  const esperado = process.env.ANA_PULSO_TOKEN;
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!esperado || token !== esperado) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const inicioHoje = inicioHojeSP();
  const pulso: Record<string, unknown> = { sistema: "zello" };
  const avisos: string[] = [];

  // acessos_hoje: sem tracking próprio — beacon da Ana no layout público preenche na coleta.

  // online_agora — usuários com atividade nos últimos 15 min (lastSeenAt gravado nos painéis)
  try {
    pulso.online_agora = await prisma.user.count({
      where: { lastSeenAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } },
    });
  } catch {
    avisos.push("metrica online_agora indisponivel");
  }

  // novos_cadastros_hoje + cadastros_por_nivel — usuários criados hoje, por papel
  try {
    const rows = await prisma.user.groupBy({
      by: ["role"],
      where: { createdAt: { gte: inicioHoje } },
      _count: { _all: true },
    });
    const porNivel: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      porNivel[NIVEL[r.role] ?? r.role.toLowerCase()] = r._count._all;
      total += r._count._all;
    }
    pulso.novos_cadastros_hoje = total;
    pulso.cadastros_por_nivel = porNivel;
  } catch {
    avisos.push("metrica novos_cadastros_hoje indisponivel");
  }

  // vendas_hoje / transacionado_hoje_centavos — pagamentos PAGOS hoje (Efí PIX/cartão, paidAt)
  try {
    const agg = await prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: inicioHoje } },
      _count: { _all: true },
      _sum: { amount: true },
    });
    pulso.vendas_hoje = agg._count._all;
    pulso.transacionado_hoje_centavos = Math.round(Number(agg._sum.amount ?? 0) * 100);
  } catch {
    avisos.push("metrica vendas_hoje indisponivel");
  }

  // tarefas_pendentes — pendências esperando alguém: KYC a analisar, saques a pagar,
  // contratações aguardando pagamento do cliente
  try {
    const [kycPendente, saquesPendentes, aguardandoPagamento] = await Promise.all([
      prisma.user.count({ where: { kycStatus: "SUBMITTED" } }),
      prisma.withdrawTicket.count({ where: { status: "REQUESTED" } }),
      prisma.booking.count({ where: { status: "PENDING_PAYMENT" } }),
    ]);
    pulso.tarefas_pendentes = kycPendente + saquesPendentes + aguardandoPagamento;
    if (kycPendente > 0) avisos.push(`${kycPendente} KYC aguardando analise`);
    if (saquesPendentes > 0) avisos.push(`${saquesPendentes} saque(s) aguardando pagamento`);
  } catch {
    avisos.push("metrica tarefas_pendentes indisponivel");
  }

  // chamados_abertos — disputas abertas/em análise
  try {
    const disputas = await prisma.dispute.count({
      where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
    });
    pulso.chamados_abertos = disputas;
    if (disputas > 0) avisos.push(`${disputas} disputa(s) aberta(s)`);
  } catch {
    avisos.push("metrica chamados_abertos indisponivel");
  }

  pulso.avisos = avisos;
  return NextResponse.json(pulso);
}
