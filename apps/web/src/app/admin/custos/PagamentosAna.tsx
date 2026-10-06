"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from "react";
import type { PagamentosAna as Estado } from '@/lib/custosAna';

/* ══ O QUE JÁ FOI PAGO — E O QUE FALTA ══
   Este quadro não guarda nada aqui dentro: ele mostra as contas deste sistema
   como elas estão no controle da Diretório Web e escreve de volta lá quando
   você marca. Assim o "paguei" vale em qualquer computador, para todo mundo
   que abre esta página, e ninguém cobra o que já foi pago. */

type Marcar = (tipo: "custos" | "dev", mes: string, pago: boolean) => Promise<Estado | null>;
type Tipo = "custos" | "dev";
type Sinc = "quieto" | "indo" | "ok" | "erro";

/* ── o ✓ de pago mora num lugar só: a conta da Ana ──
   O estado da Ana é um só pra página inteira: este quadro e o relatório lá
   embaixo leem o mesmo, e qualquer baixa (daqui ou de dentro do relatório)
   passa por `avisar` e redesenha os dois com a resposta — saldos inclusive. */
type Ctx = { estado: Estado; sinc: Sinc; avisar: (tipo: Tipo, mes: string, pago: boolean) => Promise<Estado | null> };
const EstadoCtx = createContext<Ctx | null>(null);

export function EstadoDaAna({ inicial, marcar, children }: { inicial: Estado; marcar: Marcar; children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado>(inicial);
  const [sinc, setSinc] = useState<Sinc>("quieto");
  const avisar = useCallback(
    async (tipo: Tipo, mes: string, pago: boolean) => {
      setSinc("indo");
      const novo = await marcar(tipo, mes, pago).catch(() => null);
      if (novo) setEstado(novo);
      setSinc(novo ? "ok" : "erro");
      return novo;
    },
    [marcar],
  );
  return <EstadoCtx.Provider value={{ estado, sinc, avisar }}>{children}</EstadoCtx.Provider>;
}

/** O mês está pago na Ana? A conta do mês manda; mês sem conta (só com o saldo
 *  que caiu nele) tem o estado do próprio saldo. `null` = a Ana não conhece. */
export function pagoNaAna(e: Estado | null | undefined, tipo: Tipo, mes: string): boolean | null {
  if (!e) return null;
  const conta = e[tipo][mes];
  if (conta) return conta.pago;
  const ss = (e.saldos ?? []).filter((s) => s.tipo === tipo && s.destino === mes);
  return ss.length ? ss.every((s) => s.pago) : null;
}

/** Os meses do relatório, com as chaves de ✓ de cada um (o que dá pra marcar). */
export type MesMarcavel = { tipo: Tipo; mes: string; chaves: string[] };

/* ══ O ✓ DE DENTRO DO RELATÓRIO TAMBÉM É DA ANA ══
   O relatório marca item a item (no navegador, como sempre), mas o MÊS pago é
   o da Ana:
   · ao abrir, mês pago lá entra marcado aqui; mês reaberto lá desmarca aqui;
   · mês que fecha (ou reabre) aqui — item a item ou no botão do mês — dá a
     baixa (ou tira) lá, com erro visível se não der;
   · baixa dada no quadro de cima acende (ou apaga) o mês no relatório.
   Migração única: na primeira visita depois disso, mês fechado neste navegador
   e em aberto na Ana é empurrado pra lá (`<chave>:ana` marca que já foi).
   Depois, a Ana manda nos dois sentidos. O saldo não tem ✓ aqui: é dela. */
export function useBaixaNaAna({
  chave,
  pronto,
  meses,
  pagos,
  marcarChaves,
}: {
  chave: string;
  pronto: boolean;
  meses: MesMarcavel[];
  pagos: Record<string, boolean>;
  marcarChaves: (chaves: string[], pago: boolean) => void;
}) {
  const ctx = useContext(EstadoCtx);
  const estado = ctx?.estado ?? null;
  const hidratou = useRef(false);
  const migrado = useRef(false);
  // mês completo (todos os ✓) na última passada — é a virada que avisa a Ana
  const completoAntes = useRef<Record<string, boolean>>({});
  // os ✓ do jeito que estavam quando a Ana foi lida (a mesma passada não conta)
  const pagosDaLeitura = useRef<Record<string, boolean> | null>(null);
  const anaAntes = useRef<Estado | null>(estado);
  // o que eu mesmo mandei pra Ana (mês → valor), pra não voltar como "mudou lá"
  const meus = useRef(new Map<string, boolean>());

  const mandar = (tipo: Tipo, mes: string, pago: boolean) => {
    if (!ctx) return;
    const k = `${tipo}:${mes}`;
    if (meus.current.get(k) === pago) return; // já está indo
    meus.current.set(k, pago);
    void ctx.avisar(tipo, mes, pago).then((r) => {
      if (!r) meus.current.delete(k);
    });
  };

  /* 1) ao abrir: a Ana é quem diz que mês está pago */
  useEffect(() => {
    if (!pronto || hidratou.current || !estado) return;
    hidratou.current = true;
    pagosDaLeitura.current = pagos;
    try {
      migrado.current = window.localStorage.getItem(`${chave}:ana`) === "1";
    } catch {
      /* sem localStorage: segue como migrado-não */
    }
    const depois: Record<string, boolean> = {};
    for (const m of meses) {
      if (!m.chaves.length) continue;
      const la = pagoNaAna(estado, m.tipo, m.mes);
      const todos = m.chaves.every((k) => pagos[k]);
      let fica = todos;
      if (la === true && !todos) {
        marcarChaves(m.chaves, true);
        fica = true;
      } else if (la === false && migrado.current && todos) {
        marcarChaves(m.chaves, false);                 // reaberto lá depois da migração
        fica = false;
      } else if (la === false && !migrado.current && todos) {
        mandar(m.tipo, m.mes, true);                   // migração: fechado aqui, aberto lá
      }
      depois[`${m.tipo}:${m.mes}`] = fica;
    }
    completoAntes.current = depois;
    try {
      window.localStorage.setItem(`${chave}:ana`, "1");
    } catch {
      /* quota cheia / modo privado */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto]);

  /* 2) mês que fecha ou reabre aqui, por qualquer caminho, avisa a Ana */
  useEffect(() => {
    if (!hidratou.current || !ctx || pagos === pagosDaLeitura.current) return;
    const antes = completoAntes.current;
    const agora: Record<string, boolean> = {};
    for (const m of meses) {
      if (!m.chaves.length) continue;
      const k = `${m.tipo}:${m.mes}`;
      const v = m.chaves.every((c) => pagos[c]);
      agora[k] = v;
      if (antes[k] === undefined || antes[k] === v) continue;   // não virou
      const la = pagoNaAna(ctx.estado, m.tipo, m.mes);
      if (la === null || la === v) continue;          // a Ana não conhece o mês, ou já está igual
      mandar(m.tipo, m.mes, v);
    }
    completoAntes.current = agora;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagos]);

  /* 3) baixa dada no quadro de cima (ou em outro computador e recarregada) */
  useEffect(() => {
    const antes = anaAntes.current;
    anaAntes.current = estado;
    if (!hidratou.current || !antes || !estado || antes === estado) return;
    for (const m of meses) {
      const k = `${m.tipo}:${m.mes}`;
      const depois = pagoNaAna(estado, m.tipo, m.mes);
      if (meus.current.has(k) && meus.current.get(k) === depois) {
        meus.current.delete(k);                        // era a minha resposta
        continue;
      }
      if (depois === null || depois === pagoNaAna(antes, m.tipo, m.mes) || !m.chaves.length) continue;
      marcarChaves(m.chaves, depois);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return {
    /** estado da última ida à Ana (pra mostrar "avisando… / ✓ avisado / erro") */
    sinc: ctx?.sinc ?? ("quieto" as Sinc),
    // ligado = a Ana respondeu com alguma conta deste sistema
    ligado: Boolean(
      estado && (Object.keys(estado.custos).length || Object.keys(estado.dev).length || (estado.saldos ?? []).length),
    ),
    /** mês só com saldo: o botão do mês dá a baixa direto na Ana */
    avisarMes: (tipo: Tipo, mes: string, pago: boolean) => mandar(tipo, mes, pago),
    estado,
  };
}

/** Os saldos como estão agora (os que vieram do servidor, se não houver o contexto). */
export function useSaldosDaAna(reserva: Estado["saldos"] = []): Estado["saldos"] {
  return useContext(EstadoCtx)?.estado.saldos ?? reserva;
}

const real = (centavos: number) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const mesBonito = (m: string) => {
  const [a, mm] = m.split("-");
  return `${MESES[Number(mm) - 1] ?? mm}/${a}`;
};
const dia = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export default function PagamentosAna({ inicial, marcar }: { inicial: Estado; marcar: Marcar }) {
  const ctx = useContext(EstadoCtx);
  const [proprio, setProprio] = useState<Estado>(inicial);
  const estado = ctx?.estado ?? proprio;
  const [mexendo, setMexendo] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [, comecar] = useTransition();
  const saldos = estado.saldos ?? [];

  // o mês de destino de um saldo aparece mesmo antes de ter a conta dele
  const meses = Array.from(
    new Set([...Object.keys(estado.custos), ...Object.keys(estado.dev), ...saldos.map((s) => s.destino)]),
  ).sort().reverse();
  if (meses.length === 0) return null;

  const clicar = (tipo: Tipo, mes: string, pago: boolean) => {
    setMexendo(`${tipo}:${mes}`);
    comecar(async () => {
      const novo = ctx ? await ctx.avisar(tipo, mes, !pago) : await marcar(tipo, mes, !pago).catch(() => null);
      if (novo && !ctx) setProprio(novo);
      setFalhou(!novo);
      setMexendo(null);
    });
  };

  const botao = (tipo: Tipo, mes: string, pago: boolean, vence?: string) => {
    const ocupado = mexendo === `${tipo}:${mes}`;
    return (
      <button
        type="button"
        onClick={() => clicar(tipo, mes, pago)}
        disabled={ocupado}
        title={pago ? "marcado como pago — clique para desfazer" : vence ? `vence ${dia(vence)} — clique quando pagar` : "clique quando pagar"}
        style={{
          cursor: "pointer", borderRadius: 999, padding: "2px 10px", fontSize: ".72rem",
          border: "1px solid currentColor", background: "transparent",
          opacity: ocupado ? 0.5 : 1, color: pago ? "#3ecf8e" : "inherit",
        }}
      >
        {ocupado ? "…" : pago ? "✓ pago" : vence ? `em aberto · vence ${dia(vence)}` : "em aberto"}
      </button>
    );
  };

  /* saldo que cai neste mês: baixa junto com o mês (é a Ana que dá) */
  const saldosDaCelula = (tipo: Tipo, mes: string) =>
    saldos
      .filter((s) => s.tipo === tipo && s.destino === mes)
      .map((s) => (
        <span key={s.ref} style={{ display: "block", fontSize: ".74rem", marginTop: 4, opacity: 0.85 }}>
          <span style={{ color: s.centavos < 0 ? "#3ecf8e" : "inherit", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
            {s.centavos < 0 ? "−" : "+"}{real(Math.abs(s.centavos))}
          </span>{" "}
          {s.centavos < 0 ? "crédito" : "saldo"} de {mesBonito(s.origem)} · {s.pago ? "✓ pago" : "em aberto"}
        </span>
      ));

  const celula = (tipo: Tipo, mes: string) => {
    const e = estado[tipo][mes];
    const extras = saldosDaCelula(tipo, mes);
    if (!e) {
      if (!extras.length) return <span style={{ opacity: 0.4 }}>—</span>;
      // mês só com saldo: o estado do mês é o do próprio saldo, e a baixa vale igual
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {botao(tipo, mes, pagoNaAna(estado, tipo, mes) === true)}
          <span style={{ flexBasis: "100%" }}>{extras}</span>
        </span>
      );
    }
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <b style={{ fontVariantNumeric: "tabular-nums" }}>{real(e.centavos)}</b>
        {botao(tipo, mes, e.pago, e.vencimento)}
        {extras.length > 0 && <span style={{ flexBasis: "100%" }}>{extras}</span>}
      </span>
    );
  };

  return (
    <section style={{ border: "1px solid rgba(127,127,127,.28)", borderRadius: 14, padding: 16, margin: "0 0 22px" }}>
      <p style={{ margin: "0 0 2px", fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.6 }}>
        pagamentos
      </p>
      <p style={{ margin: "0 0 12px", fontSize: ".8rem", opacity: 0.7 }}>
        o que já foi pago e o que está em aberto, mês a mês. Marcar aqui (ou fechar o mês no relatório abaixo) avisa o
        controle da Diretório Web na hora — e o que for baixado lá aparece aqui.
      </p>
      {falhou && (
        <p role="alert" style={{ margin: "0 0 10px", fontSize: ".8rem", color: "#e5484d" }}>
          não consegui avisar o controle da Diretório Web — nada mudou lá. Tente de novo em instantes.
        </p>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".84rem" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.6, fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".08em" }}>
              <th style={{ padding: "6px 10px 6px 0" }}>mês</th>
              <th style={{ padding: "6px 10px" }}>infraestrutura</th>
              <th style={{ padding: "6px 0 6px 10px" }}>desenvolvimento</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((m) => (
              <tr key={m} style={{ borderTop: "1px solid rgba(127,127,127,.18)" }}>
                <td style={{ padding: "9px 10px 9px 0", whiteSpace: "nowrap" }}>{mesBonito(m)}</td>
                <td style={{ padding: "9px 10px" }}>{celula("custos", m)}</td>
                <td style={{ padding: "9px 0 9px 10px" }}>{celula("dev", m)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
