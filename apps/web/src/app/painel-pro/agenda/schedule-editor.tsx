'use client';

import { useState, useTransition } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { WEEKDAYS, type ScheduleSlot } from '@/lib/service-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SlotState extends ScheduleSlot {
  _key: string;
}

const DEFAULT_FAIXAS: Array<Omit<ScheduleSlot, 'weekday'>> = [
  { startTime: '08:00', endTime: '12:00' },
  { startTime: '14:00', endTime: '18:00' },
];

function uid() {
  return Math.random().toString(36).slice(2);
}

export function ScheduleEditor({ initialSlots }: { initialSlots: ScheduleSlot[] }) {
  const [slots, setSlots] = useState<SlotState[]>(
    initialSlots.map((s) => ({ ...s, _key: uid() })),
  );
  const [pending, startTransition] = useTransition();

  const slotsByDay = (day: ScheduleSlot['weekday']) =>
    slots.filter((s) => s.weekday === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const addSlot = (day: ScheduleSlot['weekday']) => {
    const existing = slotsByDay(day);
    const next = existing.length === 0
      ? DEFAULT_FAIXAS[0]!
      : existing.length === 1
        ? DEFAULT_FAIXAS[1]!
        : { startTime: '19:00', endTime: '20:00' };
    setSlots((s) => [...s, { weekday: day, startTime: next.startTime, endTime: next.endTime, _key: uid() }]);
  };

  const removeSlot = (key: string) => {
    setSlots((s) => s.filter((x) => x._key !== key));
  };

  const updateSlot = (key: string, patch: Partial<ScheduleSlot>) => {
    setSlots((s) => s.map((x) => (x._key === key ? { ...x, ...patch } : x)));
  };

  const copyToAllWeekdays = () => {
    const monSlots = slotsByDay('MON');
    if (!monSlots.length) {
      toast.error('Adicione horários na segunda primeiro');
      return;
    }
    const others = slots.filter((s) => s.weekday !== 'MON');
    const cloned = (['TUE', 'WED', 'THU', 'FRI'] as const).flatMap((d) =>
      monSlots.map((s) => ({
        weekday: d,
        startTime: s.startTime,
        endTime: s.endTime,
        _key: uid(),
      })),
    );
    setSlots([
      ...slots.filter((s) => s.weekday === 'MON'),
      ...cloned,
      ...others.filter((s) => !['TUE', 'WED', 'THU', 'FRI'].includes(s.weekday)),
    ]);
    toast.success('Horários copiados para terça a sexta');
  };

  const save = async () => {
    startTransition(async () => {
      try {
        const payload = slots.map(({ weekday, startTime, endTime }) => ({
          weekday,
          startTime,
          endTime,
        }));
        const res = await fetch('/api/agenda', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slots: payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? 'Erro ao salvar');
        toast.success('Agenda atualizada');
      } catch (err) {
        toast.error('Não foi possível salvar', {
          description: err instanceof Error ? err.message : 'Tente novamente.',
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {WEEKDAYS.map((d) => {
          const daySlots = slotsByDay(d.key);
          return (
            <div key={d.key} className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg bg-secondary text-xs font-semibold uppercase">
                    {d.short}
                  </span>
                  <span className="font-medium">{d.label}</span>
                  {daySlots.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Indisponível</span>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => addSlot(d.key)}
                  className="text-zello-600"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar faixa
                </Button>
              </div>
              <div className="space-y-2 p-3">
                {daySlots.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground">
                    Nenhuma faixa configurada para {d.label.toLowerCase()}.
                  </p>
                ) : (
                  daySlots.map((s) => (
                    <div
                      key={s._key}
                      className="flex flex-wrap items-center gap-3 rounded-lg bg-secondary/50 p-3"
                    >
                      <Input
                        type="time"
                        value={s.startTime}
                        onChange={(e) => updateSlot(s._key, { startTime: e.target.value })}
                        className="w-[105px]"
                      />
                      <span className="text-sm text-muted-foreground">até</span>
                      <Input
                        type="time"
                        value={s.endTime}
                        onChange={(e) => updateSlot(s._key, { endTime: e.target.value })}
                        className="w-[105px]"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSlot(s._key)}
                        aria-label="Remover faixa"
                        className="ml-auto text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" size="sm" onClick={copyToAllWeekdays}>
          Copiar segunda para ter–sex
        </Button>
        <Button type="button" size="lg" onClick={save} disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar agenda
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
