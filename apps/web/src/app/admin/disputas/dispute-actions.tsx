'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Eye, Loader2, MessageCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatBRL } from '@/lib/pricing';

export interface DisputeActionsItem {
  id: string;
  isOpen: boolean;
  reason: string;
  clientPhone: string | null;
  clientName: string;
  proName: string;
  total: number;
}

export function DisputeActions({ dispute }: { dispute: DisputeActionsItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState<'REFUNDED' | 'RELEASED'>('REFUNDED');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const phoneClean = dispute.clientPhone?.replace(/\D/g, '');
  const whatsappUrl = phoneClean
    ? `https://wa.me/${phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`}`
    : null;

  const submit = async () => {
    if (notes.trim().length < 10) {
      toast.error('Notas (mínimo 10 caracteres)');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/disputa/${dispute.id}/resolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      toast.success('Disputa resolvida');
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error('Erro ao resolver', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="inline-flex items-center gap-1">
        {whatsappUrl ? (
          <Button
            asChild
            size="icon"
            variant="outline"
            className="h-9 w-9"
            title="WhatsApp do cliente"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
            </a>
          </Button>
        ) : null}
        <Button
          size="icon"
          variant="outline"
          className="h-9 w-9"
          onClick={() => setOpen(true)}
          title={dispute.isOpen ? 'Resolver' : 'Ver detalhes'}
        >
          {dispute.isOpen ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto pt-12">
          <h2 className="text-lg font-semibold">Disputa</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <strong>{dispute.clientName}</strong> vs <strong>{dispute.proName}</strong> ·{' '}
            {formatBRL(dispute.total)}
          </p>

          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Motivo do cliente
              </div>
              <p className="mt-1 text-sm">{dispute.reason}</p>
            </div>

            {dispute.isOpen ? (
              <>
                <div className="space-y-2">
                  <Label>Decisão</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setResolution('REFUNDED')}
                      className={
                        'rounded-xl border p-4 text-left transition-colors ' +
                        (resolution === 'REFUNDED'
                          ? 'border-zello-500 bg-zello-50 ring-2 ring-zello-200'
                          : 'border-border hover:border-zello-200')
                      }
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <RotateCcw className="h-4 w-4" />
                        Reembolsar cliente
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Devolve {formatBRL(dispute.total)} ao cliente. Profissional não recebe.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolution('RELEASED')}
                      className={
                        'rounded-xl border p-4 text-left transition-colors ' +
                        (resolution === 'RELEASED'
                          ? 'border-zello-500 bg-zello-50 ring-2 ring-zello-200'
                          : 'border-border hover:border-zello-200')
                      }
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Liberar para profissional
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Considera o serviço prestado. Profissional recebe.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dispute-notes">Notas da resolução</Label>
                  <Textarea
                    id="dispute-notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Explique a decisão. Esta nota é enviada para ambos."
                  />
                </div>

                <Button onClick={submit} disabled={busy} size="lg" className="w-full">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Resolver disputa
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Esta disputa já foi resolvida.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
