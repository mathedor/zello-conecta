import { NextResponse } from "next/server";
import { prisma } from "@zello/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGEX_ESCRITA = /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|do)\b/i;
const REGEX_SENSIVEL = /senha|password|token|secret|hash|cvv|cartao|card|chave_pix|api_key/i;
const LIMITE_PADRAO = 200;
const TIMEOUT_MS = 10000;

function autenticado(req: Request): boolean {
  const esperado = process.env.ANA_PULSO_TOKEN;
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  return Boolean(esperado) && token === esperado;
}

/** Serializa com segurança: BigInt vira number. */
function paraJson(valor: unknown) {
  return JSON.parse(
    JSON.stringify(valor, (_k, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

/** Mascara colunas sensíveis pelo nome, linha a linha. */
function mascarar(linhas: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return linhas.map((linha) => {
    const nova: Record<string, unknown> = {};
    for (const [chave, valor] of Object.entries(linha)) {
      nova[chave] = REGEX_SENSIVEL.test(chave) ? "•••" : valor;
    }
    return nova;
  });
}

async function rodarSoLeitura<T>(fn: (tx: PrismaTx) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("set transaction read only");
    await tx.$executeRawUnsafe(`set local statement_timeout = ${TIMEOUT_MS}`);
    return fn(tx);
  });
}

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function erro(mensagem: string, status: number) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}

/**
 * Conector da Ana — consulta só-leitura · /api/ana/consulta · Authorization: Bearer ANA_PULSO_TOKEN
 * GET ?esquema=1        -> lista as tabelas do schema public
 * GET ?esquema=<tabela> -> lista as colunas da tabela
 * POST { sql: "select ..." } -> roda o SELECT (só leitura, 1 comando, LIMIT 200 forçado)
 */
export async function GET(req: Request) {
  if (!autenticado(req)) return erro("não autorizado", 401);

  const url = new URL(req.url);
  const esquema = url.searchParams.get("esquema");
  if (!esquema) return erro("use ?esquema=1 para listar tabelas ou ?esquema=<tabela> para colunas", 400);

  try {
    if (esquema === "1") {
      const linhas = await rodarSoLeitura((tx) =>
        tx.$queryRawUnsafe(
          `select table_name from information_schema.tables where table_schema = 'public' order by table_name`
        )
      );
      const dados = paraJson(linhas) as Array<Record<string, unknown>>;
      return NextResponse.json({ ok: true, linhas: dados.length, dados });
    }

    const linhas = await rodarSoLeitura((tx) =>
      tx.$queryRawUnsafe(
        `select column_name, data_type, is_nullable
         from information_schema.columns
         where table_schema = 'public' and table_name = $1
         order by ordinal_position`,
        esquema
      )
    );
    const dados = paraJson(linhas) as Array<Record<string, unknown>>;
    return NextResponse.json({ ok: true, linhas: dados.length, dados });
  } catch (e) {
    return erro(e instanceof Error ? e.message : "falha ao ler o esquema", 400);
  }
}

export async function POST(req: Request) {
  if (!autenticado(req)) return erro("não autorizado", 401);

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return erro("corpo inválido, esperado JSON com { sql }", 400);
  }

  const sqlOriginal = (corpo as { sql?: unknown })?.sql;
  if (typeof sqlOriginal !== "string" || !sqlOriginal.trim()) {
    return erro("informe { sql: \"select ...\" }", 400);
  }

  let sql = sqlOriginal.trim();
  // um comando só: remove um único ; final, mas derruba se houver ; no meio
  const semPontoVirgulaFinal = sql.replace(/;\s*$/, "");
  if (semPontoVirgulaFinal.includes(";")) {
    return erro("apenas um comando por vez", 400);
  }
  sql = semPontoVirgulaFinal;

  if (!/^\s*(select|with)\b/i.test(sql)) {
    return erro("só é permitido SELECT ou WITH", 400);
  }

  if (REGEX_ESCRITA.test(sql)) {
    return erro("comando de escrita não é permitido", 400);
  }

  if (!/\blimit\s+\d+/i.test(sql)) {
    sql = `${sql} limit ${LIMITE_PADRAO}`;
  }

  try {
    const linhas = await rodarSoLeitura((tx) => tx.$queryRawUnsafe(sql));
    const dados = mascarar(paraJson(linhas) as Array<Record<string, unknown>>);
    return NextResponse.json({ ok: true, linhas: dados.length, dados });
  } catch (e) {
    return erro(e instanceof Error ? e.message : "falha ao rodar a consulta", 400);
  }
}
