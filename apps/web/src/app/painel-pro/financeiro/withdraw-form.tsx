'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Banknote, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MIN_WITHDRAW } from '@/lib/finance-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function WithdrawForm({
  available,
  hasPayoutAccount,
}: {
  available: number;
  hasPayoutAccount: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    if (value < MIN_WITHDRAW) {
      toast.error(`Valor mínimo: R$ ${MIN_WITHDRAW.toFixed(2)}`);
      return;
    }
    if (value > available) {
      toast.error('Valor maior que o saldo disponível');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/saque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      toast.success('Solicitação criada — processamento em até 2 dias úteis');
      setAmount('');
      router.refresh();
    } catch (err) {
      toast.error('Não foi possível solicitar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPayoutAccount) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Cadastre seus dados de PIX no card ao lado para liberar o saque.
      </div>
    );
  }

  if (available < MIN_WITHDRAW) {
    return (
      <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
        Saldo abaixo do mínimo (R$ {MIN_WITHDRAW.toFixed(2)}). Continue prestando serviços para
        liberar.{' '}
        <Link href="/painel-pro/pedidos" className="text-zello-600 hover:underline">
          Ver pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Valor do saque</Label>
        <Input
          id="amount"
          type="number"
          min={MIN_WITHDRAW}
          max={available}
          step="0.01"
          inputMode="decimal"
          placeholder={`${MIN_WITHDRAW.toFixed(2)} – ${available.toFixed(2)}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setAmount(available.toFixed(2))}>
          Sacar tudo
        </Button>
      </div>
      <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Solicitando...
          </>
        ) : (
          <>
            <Banknote className="h-4 w-4" />
            Solicitar saque
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Processamento manual em até 2 dias úteis. Você recebe email com comprovante.
      </p>
    </div>
  );
}
