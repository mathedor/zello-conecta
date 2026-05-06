'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function KycReviewActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');

  const approve = async () => {
    setBusy('approve');
    try {
      const res = await fetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      toast.success('Aprovado');
      router.refresh();
    } catch (err) {
      toast.error('Erro ao aprovar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    if (reason.trim().length < 10) {
      toast.error('Descreva o motivo (mínimo 10 caracteres)');
      return;
    }
    setBusy('reject');
    try {
      const res = await fetch('/api/admin/kyc/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      toast.success('Rejeitado');
      setReason('');
      router.refresh();
    } catch (err) {
      toast.error('Erro ao rejeitar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-6 space-y-4 border-t border-border pt-6">
      <div className="space-y-2">
        <Label htmlFor={`reason-${userId}`}>Motivo (necessário em caso de rejeição)</Label>
        <Textarea
          id={`reason-${userId}`}
          rows={3}
          placeholder="Ex: foto do RG está borrada, refazer com mais luz..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={approve} disabled={busy !== null} className="bg-emerald-600 hover:bg-emerald-700">
          {busy === 'approve' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Aprovar KYC
        </Button>
        <Button
          variant="outline"
          onClick={reject}
          disabled={busy !== null}
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {busy === 'reject' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Rejeitar
        </Button>
      </div>
    </div>
  );
}
