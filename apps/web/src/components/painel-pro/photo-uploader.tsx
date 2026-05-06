'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MAX = 10;

export function PhotoUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    const remaining = MAX - value.length;
    const list = Array.from(files).slice(0, remaining);
    const uploaded: string[] = [];

    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('purpose', 'service');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? 'Erro no upload');
        uploaded.push(data.url);
      }
      onChange([...value, ...uploaded]);
      toast.success(`${uploaded.length} foto(s) adicionada(s)`);
    } catch (err) {
      toast.error('Erro ao enviar foto', {
        description: err instanceof Error ? err.message : 'Tente novamente',
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url, i) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary"
          >
            <Image
              src={url}
              alt={`Foto ${i + 1}`}
              fill
              sizes="200px"
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              aria-label="Remover foto"
              onClick={() => remove(i)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {value.length < MAX ? (
          <label
            className={cn(
              'flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:border-zello-300 hover:bg-zello-50/40 hover:text-zello-700',
              busy && 'pointer-events-none opacity-60',
            )}
          >
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                upload(e.target.files);
                e.target.value = '';
              }}
            />
            {busy ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
            <span className="text-xs font-medium">Adicionar foto</span>
          </label>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {value.length}/{MAX} fotos · PNG/JPG/WEBP até 8MB · A primeira aparece como capa.
      </p>
    </div>
  );
}
