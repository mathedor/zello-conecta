'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import { reviewSchema } from '@/lib/finance-schemas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const HINTS = ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'];

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      toast.error('Selecione uma nota de 1 a 5 estrelas');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/booking/${bookingId}/avaliar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      toast.success('Avaliação enviada — obrigado!');
      router.push('/painel/agendamentos');
      router.refresh();
    } catch (err) {
      toast.error('Não foi possível enviar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const display = hover || rating;

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Sua nota</Label>
        <div className="mt-3 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              aria-label={`${n} estrelas`}
              className="rounded-lg p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-9 w-9 transition-colors',
                  n <= display
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-zinc-300',
                )}
              />
            </button>
          ))}
        </div>
        {display > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{HINTS[display - 1]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comentário (opcional)</Label>
        <Textarea
          id="comment"
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conta como foi a experiência. Pontualidade, qualidade do serviço, comunicação..."
        />
        <p className="text-xs text-muted-foreground">{comment.length}/2000</p>
      </div>

      <Button size="lg" className="w-full" onClick={submit} disabled={submitting || rating === 0}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar avaliação
          </>
        )}
      </Button>
    </div>
  );
}
