'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileUp, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function WithdrawActions({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'approve' | 'reject' | 'upload' | null>(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [reason, setReason] = useState('');

  const uploadReceipt = async (file: File) => {
    setBusy('upload');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'receipt');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      setReceiptUrl(data.url);
      toast.success('Comprovante anexado');
    } catch (err) {
      toast.error('Erro no upload', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setBusy(null);
    }
  };

  const approve = async () => {
    if (!receiptUrl) {
      toast.error('Anexe o comprovante de transferência');
      return;
    }
    setBusy('approve');
    try {
      const res = await fetch(`/api/admin/saque/${ticketId}/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptUrl }),
      });
      if (!res.ok) throw new Error();
      toast.success('Saque marcado como pago');
      router.refresh();
    } catch {
      toast.error('Erro ao aprovar');
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    if (reason.trim().length < 10) {
      toast.error('Motivo (mínimo 10 caracteres)');
      return;
    }
    setBusy('reject');
    try {
      const res = await fetch(`/api/admin/saque/${ticketId}/rejeitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      toast.success('Saque rejeitado e valor devolvido ao saldo do profissional');
      router.refresh();
    } catch {
      toast.error('Erro ao rejeitar');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-6 space-y-4 border-t border-border pt-6">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Comprovante de transferência
        </Label>
        {receiptUrl ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 className="h-4 w-4" />
            Anexado:{' '}
            <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="truncate underline">
              {receiptUrl.split('/').pop()}
            </a>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 px-3 py-2.5 text-sm hover:border-zello-200">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="sr-only"
              disabled={busy !== null}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadReceipt(file);
              }}
            />
            <FileUp className="h-4 w-4 text-muted-foreground" />
            <span>{busy === 'upload' ? 'Enviando...' : 'Anexar PDF ou imagem'}</span>
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={approve}
          disabled={busy !== null || !receiptUrl}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {busy === 'approve' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Marcar como pago
        </Button>
      </div>

      <div className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <Label className="text-xs uppercase tracking-wider text-destructive">
          Rejeitar (devolve ao saldo)
        </Label>
        <Textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo da rejeição (mín 10 caracteres)..."
        />
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
