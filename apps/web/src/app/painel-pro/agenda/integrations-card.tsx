'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckCircle2, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface IntegrationsCardProps {
  professionalId: string;
  appUrl: string;
  googleConnected: boolean;
  googleConfigured: boolean;
  status?: string;
}

export function IntegrationsCard({
  professionalId,
  appUrl,
  googleConnected,
  googleConfigured,
  status,
}: IntegrationsCardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const icalUrl = `${appUrl}/api/agenda.ics?token=${professionalId}`;
  const webcalUrl = icalUrl.replace(/^https?:\/\//, 'webcal://');

  const copyIcs = async () => {
    try {
      await navigator.clipboard.writeText(icalUrl);
      toast.success('Link iCal copiado!');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/calendar/google/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Google Calendar desconectado');
      router.refresh();
    } catch {
      toast.error('Erro ao desconectar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {status === 'connected' ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          ✓ Google Calendar conectado. Novas reservas aparecem automaticamente no seu calendário.
        </div>
      ) : status === 'error' || status === 'state-mismatch' ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Erro ao conectar com o Google. Tente novamente.
        </div>
      ) : status === 'missing-config' ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Integração com Google Calendar ainda não configurada na plataforma.
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zello-50 text-zello-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Google Calendar</h3>
              {googleConnected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Conectado
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sincroniza automaticamente cada reserva confirmada com seu calendário.
            </p>

            {!googleConfigured ? (
              <p className="mt-3 rounded-lg bg-secondary/50 p-2 text-[11px] text-muted-foreground">
                ⚠️ Em breve. A administração precisa configurar GOOGLE_CLIENT_ID/SECRET.
              </p>
            ) : googleConnected ? (
              <Button
                onClick={disconnect}
                disabled={busy}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Desconectar
              </Button>
            ) : (
              <Button asChild size="sm" className="mt-3">
                <a href="/api/calendar/google/connect">
                  <ExternalLink className="h-4 w-4" />
                  Conectar Google Calendar
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zello-50 text-zello-600">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold">Apple Calendar / iCal / Outlook</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Adicione esta URL como calendário externo no seu app de agenda. Atualiza
              automaticamente a cada poucos minutos.
            </p>

            <div className="mt-3 break-all rounded-lg bg-secondary/40 p-2 font-mono text-[11px]">
              {icalUrl}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={copyIcs} variant="outline" size="sm">
                Copiar URL
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={webcalUrl}>Abrir no Apple Calendar</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={icalUrl} download>
                  Baixar .ics
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
