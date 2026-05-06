'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageItem {
  id: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  other: { name: string; avatarUrl: string | null; href: string | null };
  bookingRef: string | null;
  bookingDate: string | null;
  initialMessages: MessageItem[];
}

const POLL_MS = 5000;

export function ChatThread({
  conversationId,
  currentUserId,
  other,
  bookingRef,
  bookingDate,
  initialMessages,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initials = other.name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const scrollToBottom = useCallback((smooth = false) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch(`/api/conversas/${conversationId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { messages: MessageItem[] };
        setMessages((prev) => {
          if (prev.length === data.messages.length) return prev;
          return data.messages;
        });
      } catch {
        // ignore
      }
    };
    const id = window.setInterval(fetchUpdates, POLL_MS);
    return () => window.clearInterval(id);
  }, [conversationId]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    const optimistic: MessageItem = {
      id: `optimistic-${Date.now()}`,
      senderId: currentUserId,
      body,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    try {
      const res = await fetch(`/api/conversas/${conversationId}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? data.message : m)),
      );
      window.requestAnimationFrame(() => scrollToBottom(true));
    } catch (err) {
      toast.error('Não foi possível enviar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(body);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[420px] flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-card p-4">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zello-600">
          {other.avatarUrl ? (
            <Image
              src={other.avatarUrl}
              alt={other.name}
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {other.href ? (
              <Link href={other.href} className="hover:underline">
                {other.name}
              </Link>
            ) : (
              other.name
            )}
          </p>
          {bookingRef ? (
            <p className="text-xs text-muted-foreground">
              Reserva {bookingRef.slice(0, 10)} ·{' '}
              {bookingDate
                ? new Date(bookingDate).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </p>
          ) : null}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-secondary/20 p-4">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Sem mensagens ainda. Envie a primeira.
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m, i) => {
              const mine = m.senderId === currentUserId;
              const showTime =
                i === 0 ||
                new Date(m.createdAt).getTime() -
                  new Date(messages[i - 1]!.createdAt).getTime() >
                  5 * 60 * 1000;
              return (
                <li
                  key={m.id}
                  className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}
                >
                  {showTime ? (
                    <span className="my-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  ) : null}
                  <div
                    className={cn(
                      'max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                      mine
                        ? 'bg-zello-600 text-white'
                        : 'bg-card text-foreground',
                    )}
                  >
                    {m.body}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-border bg-card p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Escreva uma mensagem..."
            rows={1}
            className="min-h-[44px] max-h-32 resize-none"
            disabled={sending}
          />
          <Button onClick={send} disabled={sending || draft.trim().length === 0} size="lg">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Enter envia · Shift+Enter quebra linha
        </p>
      </div>
    </div>
  );
}
