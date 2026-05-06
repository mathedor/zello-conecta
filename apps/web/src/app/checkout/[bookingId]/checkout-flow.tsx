'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, Copy, CreditCard, Loader2, QrCode, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Method = 'PIX' | 'CARD';

interface ExistingPayment {
  id: string;
  method: 'PIX' | 'CARD';
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  qrCode: string | null;
  qrCodeImageUrl: string | null;
  copyPaste: string | null;
  expiresAt: string | null;
}

interface CheckoutFlowProps {
  bookingId: string;
  totalAmount: number;
  existingPayment: ExistingPayment | null;
}

export function CheckoutFlow({ bookingId, totalAmount, existingPayment }: CheckoutFlowProps) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>(existingPayment?.method ?? 'PIX');
  const [pix, setPix] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeImageUrl: string;
    copyPaste: string;
    expiresAt: string | null;
    isMock: boolean;
  } | null>(
    existingPayment?.method === 'PIX' && existingPayment.qrCode && existingPayment.copyPaste
      ? {
          paymentId: existingPayment.id,
          qrCode: existingPayment.qrCode,
          qrCodeImageUrl:
            existingPayment.qrCodeImageUrl ??
            `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(existingPayment.qrCode)}`,
          copyPaste: existingPayment.copyPaste,
          expiresAt: existingPayment.expiresAt,
          isMock: existingPayment.qrCode.includes('MOCK'),
        }
      : null,
  );
  const [generatingPix, setGeneratingPix] = useState(false);
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '', installments: 1 });
  const [cardLoading, setCardLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, []);

  const generatePix = async () => {
    setGeneratingPix(true);
    try {
      const res = await fetch(`/api/checkout/${bookingId}/pix`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao gerar PIX');
      setPix({
        paymentId: data.payment.id,
        qrCode: data.payment.qrCode,
        qrCodeImageUrl: data.payment.qrCodeImageUrl,
        copyPaste: data.payment.copyPaste,
        expiresAt: data.payment.expiresAt,
        isMock: data.payment.isMock,
      });
      startPolling();
    } catch (err) {
      toast.error('Não foi possível gerar PIX', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setGeneratingPix(false);
    }
  };

  const startPolling = () => {
    if (pollingRef.current) window.clearInterval(pollingRef.current);
    setPolling(true);
    pollingRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/${bookingId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.booking.status === 'CONFIRMED') {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          setPolling(false);
          toast.success('Pagamento confirmado!');
          router.push(`/checkout/${bookingId}/sucesso`);
        }
      } catch {
        // ignore
      }
    }, 4000);
  };

  const submitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (card.number.length < 12 || !card.name || card.exp.length < 4 || card.cvv.length < 3) {
      toast.error('Preencha todos os dados do cartão');
      return;
    }
    setCardLoading(true);
    try {
      const res = await fetch(`/api/checkout/${bookingId}/cartao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: card.number.replace(/\s+/g, ''),
          installments: card.installments,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro no cartão');
      if (data.payment.status === 'PAID') {
        toast.success('Pagamento aprovado!');
        router.push(`/checkout/${bookingId}/sucesso`);
      } else if (data.payment.status === 'PROCESSING') {
        toast.info('Pagamento em processamento. Acompanhe em "Meus agendamentos".');
        startPolling();
      } else {
        toast.error('Cartão recusado', { description: data.payment.message });
      }
    } catch (err) {
      toast.error('Erro no cartão', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setCardLoading(false);
    }
  };

  const copyPix = async () => {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.copyPaste);
      toast.success('Código copiado!');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  const mockConfirmPix = async () => {
    if (!pix) return;
    try {
      const res = await fetch('/api/dev/mock-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: pix.paymentId }),
      });
      if (!res.ok) throw new Error('Erro ao simular');
      toast.success('Pagamento simulado!');
      router.push(`/checkout/${bookingId}/sucesso`);
    } catch (err) {
      toast.error('Erro ao simular', {
        description: err instanceof Error ? err.message : '',
      });
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMethod('PIX')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-colors',
            method === 'PIX'
              ? 'border-zello-500 bg-zello-50/60 ring-2 ring-zello-200'
              : 'border-border bg-card hover:border-zello-200',
          )}
        >
          <Smartphone className="h-6 w-6 text-zello-600" />
          <span className="text-sm font-semibold">PIX</span>
          <span className="text-xs text-muted-foreground">Pagamento instantâneo</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod('CARD')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-colors',
            method === 'CARD'
              ? 'border-zello-500 bg-zello-50/60 ring-2 ring-zello-200'
              : 'border-border bg-card hover:border-zello-200',
          )}
        >
          <CreditCard className="h-6 w-6 text-zello-600" />
          <span className="text-sm font-semibold">Cartão de crédito</span>
          <span className="text-xs text-muted-foreground">Visa, Master, Elo</span>
        </button>
      </div>

      <div className="mt-8">
        {method === 'PIX' ? (
          pix ? (
            <div className="rounded-2xl border border-border bg-secondary/30 p-6 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-zello-50 px-3 py-1 text-xs font-medium text-zello-700">
                <QrCode className="h-3 w-3" />
                Escaneie o QR Code ou copie o código
              </div>
              <div className="mx-auto w-64 max-w-full rounded-xl bg-white p-4 shadow-sm">
                <div className="relative aspect-square">
                  <Image
                    src={pix.qrCodeImageUrl}
                    alt="QR Code PIX"
                    fill
                    sizes="256px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <div className="mx-auto mt-5 max-w-md">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Código copia e cola
                </Label>
                <div className="mt-2 flex gap-2">
                  <code className="flex-1 truncate rounded-lg border border-border bg-card px-3 py-2 text-xs">
                    {pix.copyPaste}
                  </code>
                  <Button type="button" size="icon" variant="outline" onClick={copyPix}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                {polling ? 'Aguardando confirmação automática...' : ''}
              </p>
              {pix.isMock ? (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900">
                  <strong>Modo teste:</strong> credenciais Efí ainda não configuradas. Você pode
                  simular a confirmação para seguir o fluxo.
                  <Button
                    type="button"
                    size="sm"
                    onClick={mockConfirmPix}
                    className="mt-3 bg-amber-600 hover:bg-amber-700"
                  >
                    <Check className="h-4 w-4" />
                    Simular pagamento
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <Button
              size="xl"
              className="w-full"
              onClick={generatePix}
              disabled={generatingPix}
            >
              {generatingPix ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Gerar QR Code PIX
                </>
              )}
            </Button>
          )
        ) : (
          <form onSubmit={submitCard} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Número do cartão</Label>
              <Input
                id="card-number"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                autoComplete="cc-number"
                maxLength={19}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-name">Nome impresso</Label>
              <Input
                id="card-name"
                placeholder="Como está no cartão"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                autoComplete="cc-name"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="card-exp">Validade</Label>
                <Input
                  id="card-exp"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  value={card.exp}
                  onChange={(e) => setCard({ ...card, exp: e.target.value })}
                  autoComplete="cc-exp"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="card-cvv">CVV</Label>
                <Input
                  id="card-cvv"
                  inputMode="numeric"
                  placeholder="123"
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  autoComplete="cc-csc"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="card-installments">Parcelas</Label>
                <select
                  id="card-installments"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                  value={card.installments}
                  onChange={(e) => setCard({ ...card, installments: Number(e.target.value) })}
                >
                  {[1, 2, 3, 6, 12].map((n) => (
                    <option key={n} value={n}>
                      {n}x de R$ {(totalAmount / n).toFixed(2).replace('.', ',')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" size="xl" className="w-full" disabled={cardLoading}>
              {cardLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pagar R$ {totalAmount.toFixed(2).replace('.', ',')}
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Modo teste: termine o número do cartão em <code>1</code> para simular cartão recusado.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
