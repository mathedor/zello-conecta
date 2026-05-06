'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function ContactProButton({
  professionalId,
  professionalName,
}: {
  professionalId: string;
  professionalName: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (body.trim().length < 1) {
      toast.error('Escreva uma mensagem');
      return;
    }
    if (!session?.user) {
      router.push('/entrar?next=/mensagens');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/conversas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalId, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      toast.success('Mensagem enviada');
      setOpen(false);
      router.push(`/mensagens/${data.conversationId}`);
    } catch (err) {
      toast.error('Não foi possível enviar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          <MessageCircle className="h-4 w-4" />
          Enviar mensagem
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md pt-12">
        <h2 className="text-lg font-semibold">Enviar mensagem</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          para <strong>{professionalName}</strong>. Você pode tirar dúvidas antes de contratar.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="msg">Sua mensagem</Label>
            <Textarea
              id="msg"
              rows={6}
              placeholder="Olá! Tenho dúvidas sobre o serviço..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{body.length}/2000</p>
          </div>
          <Button onClick={submit} disabled={sending} size="lg" className="w-full">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar mensagem
              </>
            )}
          </Button>
          {!session?.user ? (
            <p className="text-center text-xs text-muted-foreground">
              É necessário ter conta para enviar mensagens.
            </p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
