import { NextResponse } from "next/server";
import { prisma } from "@zello/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Conector da Ana — baixa de chamado · POST /api/ana/chamados/resolver · Bearer ANA_PULSO_TOKEN
 * Body: { "id": "<id da disputa>" }
 * Fecha a disputa como CLOSED (sem movimentação financeira — REFUNDED/RELEASED
 * mexem em saldo e são decisão exclusiva do painel admin).
 */
export async function POST(req: Request) {
  const esperado = process.env.ANA_PULSO_TOKEN;
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!esperado || token !== esperado) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ ok: false, erro: "id obrigatorio" }, { status: 400 });
  }

  // Aprovação de KYC não é baixa de chamado — só pelo painel.
  if (id.startsWith("kyc:")) {
    return NextResponse.json({ ok: false, erro: "kyc só no painel" });
  }

  try {
    const disputa = await prisma.dispute.findUnique({ where: { id }, select: { status: true } });
    if (!disputa) {
      return NextResponse.json({ ok: false, erro: "nao encontrado" }, { status: 404 });
    }
    if (["RESOLVED_REFUNDED", "RESOLVED_RELEASED", "CLOSED"].includes(disputa.status)) {
      return NextResponse.json({ ok: true, ja_estava: true });
    }
    await prisma.dispute.update({
      where: { id },
      data: {
        status: "CLOSED",
        resolvedAt: new Date(),
        resolution: "Baixa via Ana (assistente) — fechada sem movimentação financeira.",
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, erro: "falha ao resolver" }, { status: 500 });
  }
}
