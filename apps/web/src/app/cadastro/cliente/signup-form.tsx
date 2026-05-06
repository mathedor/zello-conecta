'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { signupClientSchema, type SignupClientInput } from '@/lib/auth-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';

export function ClientSignupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupClientInput>({ resolver: zodResolver(signupClientSchema) });
  const phoneValue = watch('phone') ?? '';

  const onSubmit = async (values: SignupClientInput) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/cadastro/cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Erro ao cadastrar');
      }

      const login = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (login?.error) {
        toast.success('Conta criada!', { description: 'Faça login para continuar.' });
        router.push('/entrar');
      } else {
        toast.success('Tudo certo!', { description: 'Bem-vindo à Zello Conecta.' });
        router.push('/painel');
        router.refresh();
      }
    } catch (err) {
      toast.error('Erro ao cadastrar', {
        description: err instanceof Error ? err.message : 'Tente novamente em instantes.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          autoComplete="name"
          autoFocus
          placeholder="Como devemos te chamar?"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
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
        {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone (opcional)</Label>
        <PhoneInput
          id="phone"
          value={phoneValue}
          onChange={(raw) => setValue('phone', raw)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            aria-invalid={!!errors.password}
            className="pr-12"
            {...register('password')}
          />
          <button
            type="button"
            aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type={showPwd ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Digite a senha novamente"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 pt-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-zello-600"
          {...register('accept')}
        />
        <span className="text-muted-foreground">
          Aceito os Termos de uso e a Política de Privacidade.
        </span>
      </label>
      {errors.accept ? <p className="text-xs text-destructive">{errors.accept.message}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Criar conta
          </>
        )}
      </Button>
    </form>
  );
}
