'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileUp, Loader2, Send, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type DocType = 'RG_FRONT' | 'RG_BACK' | 'SELFIE' | 'PROOF_OF_ADDRESS';

interface DocSlot {
  type: DocType;
  label: string;
  required: boolean;
  hint: string;
}

const SLOTS: DocSlot[] = [
  { type: 'RG_FRONT', label: 'Frente RG/CNH', required: true, hint: 'Foto nítida da frente do documento' },
  { type: 'RG_BACK', label: 'Verso RG/CNH', required: true, hint: 'Foto nítida do verso do documento' },
  { type: 'SELFIE', label: 'Selfie com documento', required: true, hint: 'Você segurando o documento perto do rosto' },
  { type: 'PROOF_OF_ADDRESS', label: 'Comprovante de endereço', required: false, hint: 'Conta de luz/água/internet recente (opcional)' },
];

interface UploadedDoc {
  type: DocType;
  url: string;
  fileName: string;
}

export function KycForm() {
  const router = useRouter();
  const [docs, setDocs] = useState<Record<DocType, UploadedDoc | null>>({
    RG_FRONT: null,
    RG_BACK: null,
    SELFIE: null,
    PROOF_OF_ADDRESS: null,
  });
  const [uploading, setUploading] = useState<DocType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFile = async (type: DocType, file: File) => {
    setUploading(type);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'kyc');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro no upload');
      setDocs((d) => ({ ...d, [type]: { type, url: data.url, fileName: file.name } }));
      toast.success('Arquivo enviado');
    } catch (err) {
      toast.error('Erro no upload', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setUploading(null);
    }
  };

  const removeDoc = (type: DocType) => {
    setDocs((d) => ({ ...d, [type]: null }));
  };

  const requiredOk = SLOTS.filter((s) => s.required).every((s) => docs[s.type]);

  const submit = async () => {
    if (!requiredOk) {
      toast.error('Faltam documentos obrigatórios');
      return;
    }
    setSubmitting(true);
    try {
      const documents = SLOTS.filter((s) => docs[s.type]).map((s) => ({
        type: s.type,
        url: docs[s.type]!.url,
      }));
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao enviar');
      toast.success('KYC enviado!', { description: 'Análise em até 24h úteis.' });
      router.push('/painel-pro');
      router.refresh();
    } catch (err) {
      toast.error('Não foi possível enviar agora', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {SLOTS.map((slot) => {
        const doc = docs[slot.type];
        const isUploading = uploading === slot.type;
        return (
          <Card key={slot.type} className={doc ? 'border-emerald-200 bg-emerald-50/30' : ''}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex flex-1 items-start gap-3 sm:items-center">
                {doc ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 sm:mt-0" />
                ) : (
                  <FileUp className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground sm:mt-0" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{slot.label}</span>
                    {slot.required ? (
                      <span className="text-xs font-medium text-destructive">obrigatório</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">opcional</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{slot.hint}</p>
                  {doc ? (
                    <p className="mt-1 truncate text-xs text-emerald-700">{doc.fileName}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDoc(slot.type)}
                    aria-label="Remover arquivo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(slot.type, file);
                      }}
                      disabled={isUploading}
                    />
                    <span
                      className={
                        'inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-secondary px-3 text-sm font-medium hover:bg-secondary/80 ' +
                        (isUploading ? 'opacity-60' : '')
                      }
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <FileUp className="h-4 w-4" />
                          Enviar
                        </>
                      )}
                    </span>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
        Aceitamos PNG, JPG, WEBP ou PDF de até 8MB. Garantimos a confidencialidade dos seus dados —
        ver <a href="/privacidade" className="text-zello-600 hover:underline">Política de Privacidade</a>.
      </div>

      <Button size="lg" className="w-full" onClick={submit} disabled={!requiredOk || submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar para análise
          </>
        )}
      </Button>
    </div>
  );
}
