'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  payoutAccountSchema,
  type PayoutAccountInput,
  PIX_KEY_TYPE_LABELS,
} from '@/lib/finance-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PayoutAccountForm({ initial }: { initial?: PayoutAccountInput }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PayoutAccountInput>({
    resolver: zodResolver(payoutAccountSchema),
    defaultValues: initial ?? { pixKeyType: 'CPF', pixKey: '', holderName: '' },
  });

  const onSubmit = async (values: PayoutAccountInput) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/payout-account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao salvar');
      toast.success('Dados salvos!');
      router.refresh();
    } catch (err) {
      toast.error('Não foi possível salvar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="holderName">Nome do titular</Label>
        <Input id="holderName" placeholder="Conforme conta bancária" {...register('holderName')} />
        {errors.holderName ? (
          <p className="text-xs text-destructive">{errors.holderName.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="pixKeyType">Tipo de chave</Label>
          <select
            id="pixKeyType"
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('pixKeyType')}
          >
            {Object.entries(PIX_KEY_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="pixKey">Chave PIX</Label>
          <Input id="pixKey" placeholder="Sua chave PIX" {...register('pixKey')} />
          {errors.pixKey ? (
            <p className="text-xs text-destructive">{errors.pixKey.message}</p>
          ) : null}
        </div>
      </div>

      <details className="rounded-xl border border-border bg-secondary/30 p-3 text-sm">
        <summary className="cursor-pointer font-medium">Dados bancários (opcional)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Input placeholder="Banco (ex: 077 Inter)" {...register('bankName')} />
          <Input placeholder="Código do banco" {...register('bankCode')} />
          <Input placeholder="Agência" {...register('agency')} />
          <Input placeholder="Conta" {...register('account')} />
          <select
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('accountType')}
          >
            <option value="">Tipo de conta</option>
            <option value="CC">Conta Corrente</option>
            <option value="CP">Poupança</option>
          </select>
          <Input placeholder="CPF/CNPJ do titular" {...register('holderDoc')} />
        </div>
      </details>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Salvar dados
          </>
        )}
      </Button>
    </form>
  );
}
