import { NextResponse } from "next/server";
import { prisma } from "@zello/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "https://zello-conecta.vercel.app";

type Chamado = {
  id: string;
  titulo: string;
  de: string;
  status: string;
  prioridade: "normal" | "alta";
  criado_em: string;
  detalhe: string;
  url?: string;
};

/** Conector da Ana — chamados um a um · GET /api/ana/chamados · Bearer ANA_PULSO_TOKEN */
export async function GET(req: Request) {
  const esperado = process.env.ANA_PULSO_TOKEN;
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!esperado || token !== esperado) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const chamados: Chamado[] = [];

  // Disputas abertas/em análise — mesma entidade do chamados_abertos do pulso
  try {
    const disputas = await prisma.dispute.findMany({
      where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { openedBy: { select: { name: true, email: true } } },
    });
    for (const d of disputas) {
      chamados.push({
        id: d.id,
        titulo: `Disputa: ${d.reason.slice(0, 80)}`,
        de: d.openedBy?.name || d.openedBy?.email || "desconhecido",
        status: d.status === "OPEN" ? "aberta" : "em análise",
        prioridade: "alta",
        criado_em: d.createdAt.toISOString(),
        detalhe: d.reason,
        url: `${BASE}/admin/disputas`,
      });
    }
  } catch {
    // listagem nunca 500 — segue com o que tiver
  }

  // KYC aguardando análise — informativo; baixa só pelo painel (aprovação de KYC
  // não é baixa de chamado), por isso o id vem prefixado com "kyc:"
  try {
    if (chamados.length < 50) {
      const kyc = await prisma.user.findMany({
        where: { kycStatus: "SUBMITTED" },
        orderBy: { kycSubmittedAt: "desc" },
        take: 50 - chamados.length,
        select: { id: true, name: true, email: true, kycSubmittedAt: true, createdAt: true },
      });
      for (const u of kyc) {
        chamados.push({
          id: `kyc:${u.id}`,
          titulo: `KYC aguardando análise: ${u.name}`,
          de: u.name || u.email,
          status: "aguardando análise",
          prioridade: "normal",
          criado_em: (u.kycSubmittedAt ?? u.createdAt).toISOString(),
          detalhe: `Verificação de identidade enviada por ${u.email} — aprovar/reprovar no painel admin.`,
          url: `${BASE}/admin/kyc`,
        });
      }
    }
  } catch {
    // informativo — silencioso
  }

  return NextResponse.json({ sistema: "zello", chamados: chamados.slice(0, 50) });
}
