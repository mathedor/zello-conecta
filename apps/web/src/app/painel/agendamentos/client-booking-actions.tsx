'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CreditCard, Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { BookingStatus } from '@zello/db';

export function ClientBookingActions({
  bookingId,
  status,
  hasReview,
  hasDispute,
}: {
  bookingId: string;
  status: BookingStatus;
  hasReview: boolean;
  hasDispute: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);
  const [reason, setReason] = useState('');

  const concluir = async () => {
    setBusy('concluir');
    try {
      const res = await fetch(`/api/booking/${bookingId}/concluir`, { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Serviço marcado como concluído');
      router.refresh();
    } catch {
      toast.error('Erro ao concluir');
    } finally {
      setBusy(null);
    }
  };

  const disputar = async () => {
    if (reason.trim().length < 20) {
      toast.error('Motivo deve ter ao menos 20 caracteres');
      return;
    }
    setBusy('disputar');
    try {
      const res = await fetch(`/api/booking/${bookingId}/disputa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      toast.success('Disputa aberta. Nossa equipe vai analisar.');
      setShowDispute(false);
      router.refresh();
    } catch {
      toast.error('Erro ao abrir disputa');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
      {status === 'PENDING_PAYMENT' ? (
        <Button asChild size="sm">
          <Link href={`/checkout/${bookingId}`}>
            <CreditCard className="h-4 w-4" />
            Pagar agora
          </Link>
        </Button>
      ) : null}

      {(status === 'CONFIRMED' || status === 'IN_PROGRESS') && !hasDispute ? (
        <>
          <Button size="sm" onClick={concluir} disabled={busy !== null}>
            {busy === 'concluir' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Concluído
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDispute((s) => !s)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Flag className="h-4 w-4" />
            Abrir disputa
          </Button>
        </>
      ) : null}

      {showDispute ? (
        <div className="mt-2 w-full rounded-xl border border-destructive/30 bg-destructive/5 p-3 sm:w-[320px]">
          <Textarea
            placeholder="Descreva o problema com pelo menos 20 caracteres..."
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowDispute(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={disputar} disabled={busy !== null}>
              {busy === 'disputar' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirmar disputa
            </Button>
          </div>
        </div>
      ) : null}

      {status === 'COMPLETED' && !hasReview ? (
        <Button asChild size="sm" variant="outline">
          <Link href={`/painel/agendamentos/${bookingId}/avaliar`}>Avaliar serviço</Link>
        </Button>
      ) : null}
    </div>
  );
}
