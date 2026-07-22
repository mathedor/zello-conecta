import { NextResponse } from "next/server";
import { prisma } from "@zello/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Conector da Ana — GET /api/ana/pulso · Authorization: Bearer ANA_PULSO_TOKEN */
export async function GET(req: Request) {
  const esperado = process.env.ANA_PULSO_TOKEN;
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!esperado || token !== esperado) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // "hoje" em America/Sao_Paulo
  const agora = new Date();
  const hojeSP = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  hojeSP.setHours(0, 0, 0, 0);
  const desloc = agora.getTime() - new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })).getTime();
  const inicioHoje = new Date(hojeSP.getTime() + desloc);

  const pulso: Record<string, unknown> = { sistema: "zello" };
  const avisos: string[] = [];

  try {
    const [qtd, soma] = await Promise.all([
      prisma.payment.count({ where: { status: "PAID", createdAt: { gte: inicioHoje } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID", createdAt: { gte: inicioHoje } } }),
    ]);
    pulso.vendas_hoje = qtd;
    pulso.transacionado_hoje_centavos = Math.round(Number(soma._sum.amount ?? 0) * 100);
  } catch { avisos.push("metrica vendas_hoje indisponivel"); }

  try {
    pulso.acessos_hoje = await prisma.booking.count({ where: { createdAt: { gte: inicioHoje } } });
  } catch { avisos.push("metrica acessos_hoje indisponivel"); }

  try {
    pulso.online_agora = await prisma.session.count({ where: { expires: { gt: agora } } });
  } catch { /* auth pode ser jwt — sem sessões no banco */ }

  try {
    const [disputas, kyc] = await Promise.all([
      prisma.dispute.count({ where: { status: "OPEN" } }),
      prisma.kycDocument.count({ where: { status: "SUBMITTED" } }),
    ]);
    pulso.chamados_abertos = disputas + kyc;
    if (disputas > 0) avisos.push(`${disputas} disputa(s) aberta(s)`);
    if (kyc > 0) avisos.push(`${kyc} KYC aguardando analise`);
  } catch { avisos.push("metrica chamados_abertos indisponivel"); }

  try {
    const pendentes = await prisma.booking.count({ where: { status: "PENDING_PAYMENT", createdAt: { gte: inicioHoje } } });
    pulso.tarefas_pendentes = pendentes;
  } catch { /* sem drama */ }

  pulso.avisos = avisos;
  return NextResponse.json(pulso);
}
