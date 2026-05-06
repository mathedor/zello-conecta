'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { forgotSchema, type ForgotInput } from '@/lib/auth-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values: ForgotInput) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Erro ao enviar');
      setSent(true);
      toast.success('Email enviado', {
        description: 'Se houver conta neste email, o link de redefinição foi enviado.',
      });
    } catch (err) {
      toast.error('Não foi possível enviar agora', {
        description: err instanceof Error ? err.message : 'Tente novamente em instantes.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-zello-200 bg-zello-50/60 p-5 text-sm">
        <p className="font-medium text-zello-900">Verifique seu email</p>
        <p className="mt-1 text-zello-800">
          Se houver conta no email informado, você receberá um link para redefinir sua senha. O
          link é válido por 30 minutos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email cadastrado</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="seu@email.com"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Enviar link
          </>
        )}
      </Button>
    </form>
  );
}
