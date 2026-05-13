'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarX, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AvailabilityDay {
  date: string;
  weekday: string;
  slots: string[];
}

const WEEKDAY_LABELS: Record<string, string> = {
  MON: 'Seg',
  TUE: 'Ter',
  WED: 'Qua',
  THU: 'Qui',
  FRI: 'Sex',
  SAT: 'Sáb',
  SUN: 'Dom',
};

function dayLabel(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d!).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function BookingPicker({
  serviceId,
  initialAvailability,
  isLogged,
  initialDate,
  initialTime,
  initialNotes,
  autoBook = false,
}: {
  serviceId: string;
  initialAvailability: AvailabilityDay[];
  isLogged: boolean;
  initialDate?: string;
  initialTime?: string;
  initialNotes?: string;
  autoBook?: boolean;
}) {
  const router = useRouter();
  const firstWithSlots = initialAvailability.find((d) => d.slots.length > 0);
  const validInitialDate = initialDate
    ? initialAvailability.find((d) => d.date === initialDate)?.date
    : undefined;
  const validInitialTime =
    validInitialDate && initialTime
      ? initialAvailability
          .find((d) => d.date === validInitialDate)
          ?.slots.includes(initialTime)
        ? initialTime
        : undefined
      : undefined;

  const [selectedDate, setSelectedDate] = useState<string | null>(
    validInitialDate ?? firstWithSlots?.date ?? null,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(validInitialTime ?? null);
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const slotsForSelected = useMemo(() => {
    if (!selectedDate) return [];
    return initialAvailability.find((d) => d.date === selectedDate)?.slots ?? [];
  }, [selectedDate, initialAvailability]);

  const submit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Selecione data e horário');
      return;
    }

    if (!isLogged) {
      const sp = new URLSearchParams();
      sp.set('date', selectedDate);
      sp.set('time', selectedTime);
      if (notes) sp.set('notes', notes);
      sp.set('autoBook', '1');
      const next = `/agendar/${serviceId}?${sp.toString()}`;
      router.push(`/entrar?next=${encodeURIComponent(next)}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          date: selectedDate,
          time: selectedTime,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        const sp = new URLSearchParams();
        sp.set('date', selectedDate);
        sp.set('time', selectedTime);
        if (notes) sp.set('notes', notes);
        sp.set('autoBook', '1');
        const next = `/agendar/${serviceId}?${sp.toString()}`;
        router.push(`/entrar?next=${encodeURIComponent(next)}`);
        return;
      }
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao agendar');
      toast.success('Reserva criada! Próximo passo: pagamento.');
      router.push(`/checkout/${data.bookingId}`);
    } catch (err) {
      toast.error('Não foi possível agendar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const autoBookFired = useRef(false);
  useEffect(() => {
    if (!autoBook) return;
    if (!isLogged) return;
    if (autoBookFired.current) return;
    if (!selectedDate || !selectedTime) return;
    autoBookFired.current = true;
    submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBook, isLogged, selectedDate, selectedTime]);

  const hasAnyAvailability = initialAvailability.some((d) => d.slots.length > 0);

  if (!hasAnyAvailability) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
        <CalendarX className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-3 text-base font-semibold">Sem horários nos próximos 14 dias</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          O profissional não tem agenda disponível. Tente novamente em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Data</Label>
        <div className="mt-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {initialAvailability.map((d) => {
            const has = d.slots.length > 0;
            const active = d.date === selectedDate;
            return (
              <button
                key={d.date}
                type="button"
                disabled={!has}
                onClick={() => {
                  setSelectedDate(d.date);
                  setSelectedTime(null);
                }}
                className={cn(
                  'flex min-w-[68px] flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-3 text-center transition-colors',
                  active
                    ? 'border-zello-500 bg-zello-50 text-zello-900 ring-2 ring-zello-200'
                    : has
                      ? 'border-border bg-card text-foreground hover:border-zello-200'
                      : 'border-border bg-secondary/40 text-muted-foreground opacity-60',
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {WEEKDAY_LABELS[d.weekday] ?? d.weekday}
                </span>
                <span className="text-base font-bold leading-none">
                  {dayLabel(d.date).split(' ')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {dayLabel(d.date).split(' ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Horário</Label>
        {slotsForSelected.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Sem horários nesse dia. Selecione outro acima.
          </p>
        ) : (
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {slotsForSelected.map((time) => {
              const active = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-zello-500 bg-zello-600 text-white shadow-sm'
                      : 'border-border bg-card hover:border-zello-200 hover:bg-zello-50/50',
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="booking-notes" className="text-xs uppercase tracking-wider text-muted-foreground">
          Mensagem para o profissional (opcional)
        </Label>
        <Textarea
          id="booking-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Detalhes do que precisa, endereço se for atendimento no local..."
          className="mt-2"
        />
      </div>

      <Button
        size="xl"
        className="w-full"
        onClick={submit}
        disabled={!selectedDate || !selectedTime || submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Criando reserva...
          </>
        ) : isLogged ? (
          <>
            Continuar para pagamento
            <ArrowRight className="h-4 w-4" />
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Entrar para contratar
          </>
        )}
      </Button>
      {!isLogged ? (
        <p className="-mt-2 text-center text-xs text-muted-foreground">
          Data e horário ficam guardados — você volta direto pra contratação após o login ou cadastro.
        </p>
      ) : null}
    </div>
  );
}
