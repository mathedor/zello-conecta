'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { contactSchema, subjectLabels, type ContactInput } from '@/lib/contact-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ContactFormProps {
  defaultSubject?: ContactInput['subject'];
}

export function ContactForm({ defaultSubject = 'duvida' }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: defaultSubject, honeypot: '' },
  });

  const onSubmit = async (values: ContactInput) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Erro ao enviar');
      }

      toast.success('Mensagem enviada!', {
        description: 'Vamos responder em até 1 dia útil.',
      });
      reset({ subject: defaultSubject, honeypot: '' });
    } catch (err) {
      toast.error('Não foi possível enviar agora', {
        description: err instanceof Error ? err.message : 'Tente novamente em instantes.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
      aria-label="Formulário de contato"
    >
      <input type="text" tabIndex={-1} aria-hidden className="sr-only" {...register('honeypot')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Como devemos te chamar?"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (opcional)</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            {...register('phone')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Assunto</Label>
          <select
            id="subject"
            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            aria-invalid={!!errors.subject}
            {...register('subject')}
          >
            {Object.entries(subjectLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          id="message"
          rows={6}
          placeholder="Conte com detalhes como podemos ajudar..."
          aria-invalid={!!errors.message}
          {...register('message')}
        />
        {errors.message ? (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          Ao enviar, você concorda com nossa{' '}
          <a href="/privacidade" className="text-zello-600 hover:underline">
            Política de Privacidade
          </a>
          .
        </p>
        <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
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
      </div>
    </form>
  );
}
