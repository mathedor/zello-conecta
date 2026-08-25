'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Check,
  ChevronDown,
  CircleDollarSign,
  Pencil,
  Plus,
  Rocket,
  Server,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  API_ITEMS,
  DEV_MONTHS,
  DEV_TOTAL,
  SETUP,
  STORAGE_KEY,
  TIERS,
  USD_RATE,
  devMonthTotal,
  formatTokens,
  monthLabel,
  monthsUntil,
  tierPrice,
  type MonthlyItem,
} from '@/lib/custos-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { cn, formatBRL } from '@/lib/utils';

/* ------------------------------------------------------------------ *
 * Estado persistido
 * ------------------------------------------------------------------ */

interface ExtraCost {
  id: string;
  title: string;
  value: number;
  /** YYYY-MM-DD */
  date: string;
  /** YYYY-MM — quando preenchido, repete todo mês a partir daí */
  recurringFrom?: string;
  note?: string;
}

interface CustosState {
  /** chave `${ym}:${itemId}` */
  paidMonthly: Record<string, boolean>;
  /** chave `${devMonthKey}:${index}` */
  paidDev: Record<string, boolean>;
  paidSetup: boolean;
  /** override de valor das contas fixas, por id */
  overrides: Record<string, number>;
  extras: ExtraCost[];
}

const EMPTY: CustosState = {
  paidMonthly: {},
  paidDev: {},
  paidSetup: true,
  overrides: {},
  extras: [],
};

function loadState(): CustosState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<CustosState>) };
  } catch {
    return EMPTY;
  }
}

/* ------------------------------------------------------------------ *
 * Pequenos blocos visuais
 * ------------------------------------------------------------------ */

function ProgressBar({ pct, tone = 'zello' }: { pct: number; tone?: 'zello' | 'emerald' }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          tone === 'emerald' ? 'bg-emerald-500' : 'bg-zello-600',
        )}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

function PaidToggle({
  paid,
  onClick,
  label,
}: {
  paid: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={paid}
      title={paid ? 'Marcado como pago' : 'Marcar como pago'}
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
        paid
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-border bg-card text-transparent hover:border-emerald-400 hover:text-emerald-300',
      )}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </button>
  );
}

function EstimateChip() {
  return (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
      estimado
    </span>
  );
}

function TierChip({ tier }: { tier: keyof typeof TIERS }) {
  const map: Record<string, string> = {
    P: 'bg-slate-100 text-slate-600',
    M: 'bg-sky-50 text-sky-700',
    G: 'bg-zello-50 text-zello-700',
    X: 'bg-violet-50 text-violet-700',
  };
  return (
    <span
      title={TIERS[tier].label}
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold',
        map[tier],
      )}
    >
      {tier}
    </span>
  );
}

function Section({
  icon: Icon,
  title,
  meta,
  defaultOpen = false,
  children,
}: {
  icon: typeof Banknote;
  title: string;
  meta?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/60"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zello-50 text-zello-600">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{title}</span>
          {meta ? <span className="block text-xs text-muted-foreground">{meta}</span> : null}
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open ? <div className="border-t border-border">{children}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Página
 * ------------------------------------------------------------------ */

/* `items` chega do servidor já com o preço que a Ana leu na fatura deste mês. */
export function CustosClient({ currentMonth, items }: { currentMonth: string; items: MonthlyItem[] }) {
  const [state, setState] = useState<CustosState>(EMPTY);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  const update = useCallback((fn: (prev: CustosState) => CustosState) => {
    setState((prev) => {
      const next = fn(prev);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage cheio ou bloqueado — segue só em memória */
      }
      return next;
    });
  }, []);

  const months = useMemo(() => monthsUntil(currentMonth), [currentMonth]);

  const itemValue = useCallback(
    (item: MonthlyItem) => state.overrides[item.id] ?? item.value,
    [state.overrides],
  );

  /** Custos extras que valem para um dado mês (avulso no mês ou recorrente a partir de). */
  const extrasFor = useCallback(
    (ym: string) =>
      state.extras.filter((e) =>
        e.recurringFrom ? e.recurringFrom <= ym : e.date.slice(0, 7) === ym,
      ),
    [state.extras],
  );

  const monthRows = useCallback(
    (ym: string) => {
      const base = items.map((i) => ({
        id: i.id,
        label: i.label,
        value: itemValue(i),
        usd: i.usd,
        estimated: i.estimated,
        note: i.note,
        extra: false as const,
      }));
      const extras = extrasFor(ym).map((e) => ({
        id: `extra:${e.id}`,
        label: e.title,
        value: e.value,
        usd: undefined,
        estimated: false,
        note: e.note || (e.recurringFrom ? 'Custo recorrente registrado manualmente.' : 'Custo avulso registrado manualmente.'),
        extra: true as const,
      }));
      return [...base, ...extras];
    },
    [extrasFor, itemValue],
  );

  const monthlyNow = useMemo(
    () => monthRows(currentMonth).reduce((s, r) => s + r.value, 0),
    [monthRows, currentMonth],
  );

  const totalInvested = SETUP.value + DEV_TOTAL.value;

  const currentDevMonth = DEV_MONTHS.find((m) => m.ym === currentMonth);
  const currentDevTotal = currentDevMonth ? devMonthTotal(currentDevMonth).value : 0;
  const currentDevPaid = currentDevMonth
    ? currentDevMonth.entries.reduce(
        (s, e, i) => s + (state.paidDev[`${currentDevMonth.key}:${i}`] ? tierPrice(currentDevMonth.ym, e.tier) : 0),
        0,
      )
    : 0;
  const currentDevPct = currentDevTotal ? (currentDevPaid / currentDevTotal) * 100 : 100;

  const toggleMonthly = (ym: string, id: string) =>
    update((p) => ({
      ...p,
      paidMonthly: { ...p.paidMonthly, [`${ym}:${id}`]: !p.paidMonthly[`${ym}:${id}`] },
    }));

  const markMonthPaid = (ym: string, ids: string[], paid: boolean) =>
    update((p) => {
      const next = { ...p.paidMonthly };
      ids.forEach((id) => {
        next[`${ym}:${id}`] = paid;
      });
      return { ...p, paidMonthly: next };
    });

  const toggleDev = (key: string, i: number) =>
    update((p) => ({
      ...p,
      paidDev: { ...p.paidDev, [`${key}:${i}`]: !p.paidDev[`${key}:${i}`] },
    }));

  const markDevMonthPaid = (key: string, count: number, paid: boolean) =>
    update((p) => {
      const next = { ...p.paidDev };
      for (let i = 0; i < count; i += 1) next[`${key}:${i}`] = paid;
      return { ...p, paidDev: next };
    });

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Rocket className="h-4 w-4 text-zello-600" /> Total investido
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight">{formatBRL(totalInvested)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatBRL(SETUP.value)} de setup + {formatBRL(DEV_TOTAL.value)} de evolução
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Server className="h-4 w-4 text-zello-600" /> Custo mensal
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight">{formatBRL(monthlyNow)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Contas fixas para a plataforma ficar no ar · câmbio R$ {USD_RATE.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Wrench className="h-4 w-4 text-zello-600" /> Mês corrente
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight">{formatBRL(currentDevTotal)}</p>
          <div className="mt-2">
            <ProgressBar pct={currentDevPct} tone="emerald" />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Desenvolvimento de {monthLabel(currentMonth).toLowerCase()} · {Math.round(currentDevPct)}% pago
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        {/* ---------------- Coluna esquerda: contas fixas ---------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Custos mensais
            </h2>
            <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4" /> Registrar custo
            </Button>
          </div>

          {months.map((ym, idx) => {
            const rows = monthRows(ym);
            const total = rows.reduce((s, r) => s + r.value, 0);
            const paidValue = rows.reduce(
              (s, r) => s + (state.paidMonthly[`${ym}:${r.id}`] ? r.value : 0),
              0,
            );
            const pct = total ? (paidValue / total) * 100 : 0;
            const allPaid = pct >= 99.99;
            return (
              <Section
                key={ym}
                icon={Banknote}
                title={monthLabel(ym)}
                defaultOpen={idx === 0}
                meta={
                  <>
                    {formatBRL(total)} · {Math.round(pct)}% pago
                  </>
                }
              >
                <div className="px-5 pt-4">
                  <ProgressBar pct={pct} tone={allPaid ? 'emerald' : 'zello'} />
                </div>
                <ul className="mt-1">
                  {rows.map((r) => {
                    const key = `${ym}:${r.id}`;
                    const paid = !!state.paidMonthly[key];
                    return (
                      <li
                        key={r.id}
                        className="flex items-start gap-3 border-b border-border/60 px-5 py-3 last:border-0"
                      >
                        <PaidToggle
                          paid={paid}
                          onClick={() => toggleMonthly(ym, r.id)}
                          label={`Marcar ${r.label} como pago`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  paid && 'text-muted-foreground line-through decoration-emerald-500/50',
                                )}
                              >
                                {r.label}
                              </span>
                              {r.estimated ? <EstimateChip /> : null}
                            </span>
                            <span className="flex shrink-0 items-center gap-1.5">
                              {editing === key && !r.extra ? (
                                <Input
                                  autoFocus
                                  type="number"
                                  step="0.01"
                                  defaultValue={r.value}
                                  className="h-8 w-28 text-right"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.currentTarget.blur();
                                    if (e.key === 'Escape') setEditing(null);
                                  }}
                                  onBlur={(e) => {
                                    const v = Number(e.currentTarget.value);
                                    if (Number.isFinite(v) && v >= 0) {
                                      update((p) => ({
                                        ...p,
                                        overrides: { ...p.overrides, [r.id]: v },
                                      }));
                                    }
                                    setEditing(null);
                                  }}
                                />
                              ) : (
                                <>
                                  <span className="text-sm font-semibold tabular-nums">
                                    {formatBRL(r.value)}
                                  </span>
                                  {r.usd ? (
                                    <span className="text-xs text-muted-foreground">
                                      (USD {r.usd})
                                    </span>
                                  ) : null}
                                  {r.extra ? (
                                    <button
                                      type="button"
                                      aria-label={`Remover ${r.label}`}
                                      onClick={() =>
                                        update((p) => ({
                                          ...p,
                                          extras: p.extras.filter(
                                            (x) => `extra:${x.id}` !== r.id,
                                          ),
                                        }))
                                      }
                                      className="text-muted-foreground transition-colors hover:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setEditing(key)}
                                      aria-label={`Editar valor de ${r.label}`}
                                      className="text-muted-foreground transition-colors hover:text-zello-600"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{r.note}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
                  <span className="text-sm font-semibold">
                    Total {formatBRL(total)}
                  </span>
                  <Button
                    size="sm"
                    variant={allPaid ? 'ghost' : 'outline'}
                    onClick={() => markMonthPaid(ym, rows.map((r) => r.id), !allPaid)}
                  >
                    {allPaid ? (
                      <>
                        <X className="h-4 w-4" /> Desmarcar mês
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Marcar mês como pago
                      </>
                    )}
                  </Button>
                </div>
              </Section>
            );
          })}
        </div>

        {/* ---------------- Coluna direita ---------------- */}
        <div className="space-y-4">
          {/* Setup inicial */}
          <Section
            icon={Rocket}
            title="Setup inicial (investimento)"
            defaultOpen
            meta={<>{formatBRL(SETUP.value)} · pago · fora do custo mensal</>}
          >
            <div className="flex items-start gap-3 px-5 py-4">
              <PaidToggle
                paid={state.paidSetup}
                onClick={() => update((p) => ({ ...p, paidSetup: !p.paidSetup }))}
                label="Marcar setup como pago"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{SETUP.title}</span>
                  <span className="font-semibold tabular-nums">{formatBRL(SETUP.value)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{SETUP.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Entrega da versão 1 em {SETUP.date} · valor contratado, não entra na conta mensal.
                </p>
              </div>
            </div>
          </Section>

          {/* Desenvolvimento pós-entrega */}
          <Section
            icon={Wrench}
            title="Desenvolvimento pós-entrega"
            defaultOpen
            meta={
              <>
                {formatBRL(DEV_TOTAL.value)} · {DEV_TOTAL.count} entregas ·{' '}
                {formatTokens(DEV_TOTAL.tokens)}
              </>
            }
          >
            <div className="divide-y divide-border">
              {DEV_MONTHS.map((m) => {
                const t = devMonthTotal(m);
                const paidValue = m.entries.reduce(
                  (s, e, i) => s + (state.paidDev[`${m.key}:${i}`] ? tierPrice(m.ym, e.tier) : 0),
                  0,
                );
                const pct = t.value ? (paidValue / t.value) * 100 : 0;
                const allPaid = pct >= 99.99;
                return (
                  <div key={m.key}>
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-secondary/40 px-5 py-2.5">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {m.key}
                        </span>
                        <span className="ml-2 text-sm font-medium">{m.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {formatTokens(t.tokens)}
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {formatBRL(t.value)}
                        </span>
                      </div>
                    </div>
                    <div className="px-5 pt-2">
                      <ProgressBar pct={pct} tone={allPaid ? 'emerald' : 'zello'} />
                    </div>
                    <ul className="mt-1">
                      {m.entries.map((e, i) => {
                        const paid = !!state.paidDev[`${m.key}:${i}`];
                        return (
                          <li
                            key={`${m.key}-${i}`}
                            className="flex items-start gap-3 border-b border-border/60 px-5 py-3 last:border-0"
                          >
                            <PaidToggle
                              paid={paid}
                              onClick={() => toggleDev(m.key, i)}
                              label={`Marcar ${e.title} como pago`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                                <span className="flex min-w-0 flex-wrap items-center gap-2">
                                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                    {e.date}
                                  </span>
                                  <TierChip tier={e.tier} />
                                  <span
                                    className={cn(
                                      'text-sm font-medium',
                                      paid &&
                                        'text-muted-foreground line-through decoration-emerald-500/50',
                                    )}
                                  >
                                    {e.title}
                                  </span>
                                </span>
                                <span className="shrink-0 text-right">
                                  <span className="block text-sm font-semibold tabular-nums">
                                    {formatBRL(tierPrice(m.ym, e.tier))}
                                  </span>
                                  <span className="block text-[11px] text-muted-foreground">
                                    {formatTokens(TIERS[e.tier].tokens)}
                                  </span>
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {e.description}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(pct)}% pago
                      </span>
                      <Button
                        size="sm"
                        variant={allPaid ? 'ghost' : 'outline'}
                        onClick={() => markDevMonthPaid(m.key, m.entries.length, !allPaid)}
                      >
                        {allPaid ? (
                          <>
                            <X className="h-4 w-4" /> Desmarcar mês
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" /> Marcar mês como pago
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* APIs & serviços */}
          <Section
            icon={CircleDollarSign}
            title="APIs & serviços"
            meta="Taxas cobradas por uso — informativo, não entra na soma"
          >
            <ul>
              {API_ITEMS.map((a) => (
                <li key={a.label} className="border-b border-border/60 px-5 py-3 last:border-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-sm font-medium">{a.label}</span>
                    <span className="text-sm font-medium text-zello-700">{a.fee}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.note}</p>
                </li>
              ))}
            </ul>
            <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              A Zello retém 20% de cada venda; as taxas acima são descontadas na própria
              transação e não geram fatura no fim do mês.
            </p>
          </Section>
        </div>
      </div>

      <RegistrarCustoSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={(extra) => {
          update((p) => ({ ...p, extras: [...p.extras, extra] }));
          toast.success('Custo registrado');
          setSheetOpen(false);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sheet: registrar custo
 * ------------------------------------------------------------------ */

function RegistrarCustoSheet({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (extra: ExtraCost) => void;
}) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recurringFrom, setRecurringFrom] = useState('');
  const [note, setNote] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(value.replace(',', '.'));
    if (!title.trim() || !Number.isFinite(v) || v <= 0) {
      toast.error('Informe título e valor.');
      return;
    }
    onSave({
      id: `${Date.now()}`,
      title: title.trim(),
      value: v,
      date,
      recurringFrom: recurringFrom || undefined,
      note: note.trim() || undefined,
    });
    setTitle('');
    setValue('');
    setRecurringFrom('');
    setNote('');
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <h2 className="text-lg font-semibold">Registrar custo</h2>
          <p className="text-sm text-muted-foreground">
            Entra na lista de custos mensais. Se marcar &quot;recorrente a partir de&quot;, passa
            a aparecer todo mês.
          </p>
        </SheetHeader>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="custo-titulo">Título</Label>
            <Input
              id="custo-titulo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: domínio zelloconecta.com.br"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="custo-valor">Valor (R$)</Label>
              <Input
                id="custo-valor"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custo-data">Data</Label>
              <Input
                id="custo-data"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="custo-recorrente">Recorrente a partir de</Label>
            <Input
              id="custo-recorrente"
              type="month"
              value={recurringFrom}
              onChange={(e) => setRecurringFrom(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para um custo avulso, que aparece só no mês da data.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="custo-obs">Observação</Label>
            <Textarea
              id="custo-obs"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="O que é esse custo, para o dono lembrar depois."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Salvar custo
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
