'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { signupProSchema, type SignupProInput } from '@/lib/auth-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import { formatCpf } from '@/lib/format';

export function ProSignupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupProInput>({ resolver: zodResolver(signupProSchema) });
  const phoneValue = watch('phone') ?? '';
  const cpfValue = watch('cpf') ?? '';

  const onSubmit = async (values: SignupProInput) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/cadastro/profissional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao cadastrar');

      const login = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (login?.error) {
        toast.success('Conta criada!', { description: 'Faça login para continuar.' });
        router.push('/entrar?next=/painel-pro/kyc');
      } else {
        toast.success('Cadastro feito!', {
          description: 'Próximo passo: enviar seus documentos de verificação.',
        });
        router.push('/painel-pro/kyc');
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-zello-600">
          1. Dados pessoais
        </legend>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              autoComplete="name"
              autoFocus
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              aria-invalid={!!errors.cpf}
              value={formatCpf(cpfValue)}
              onChange={(e) =>
                setValue('cpf', formatCpf(e.target.value), { shouldValidate: true })
              }
            />
            {errors.cpf ? <p className="text-xs text-destructive">{errors.cpf.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <PhoneInput
              id="phone"
              value={phoneValue}
              onChange={(raw) => setValue('phone', raw, { shouldValidate: true })}
              aria-invalid={!!errors.phone}
            />
            {errors.phone ? (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-zello-600">
          2. Senha
        </legend>

        <div className="grid gap-4 md:grid-cols-2">
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
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-zello-600">
          3. Perfil profissional
        </legend>

        <div className="space-y-2">
          <Label htmlFor="headline">Título profissional</Label>
          <Input
            id="headline"
            placeholder="Ex: Advogado especialista em direito do trabalho"
            aria-invalid={!!errors.headline}
            {...register('headline')}
          />
          <p className="text-xs text-muted-foreground">
            Frase curta que aparece ao lado do seu nome nas buscas.
          </p>
          {errors.headline ? (
            <p className="text-xs text-destructive">{errors.headline.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              placeholder="São Paulo"
              autoComplete="address-level2"
              aria-invalid={!!errors.city}
              {...register('city')}
            />
            {errors.city ? (
              <p className="text-xs text-destructive">{errors.city.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">UF</Label>
            <Input
              id="state"
              placeholder="SP"
              maxLength={2}
              autoComplete="address-level1"
              aria-invalid={!!errors.state}
              {...register('state')}
            />
            {errors.state ? (
              <p className="text-xs text-destructive">{errors.state.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Sobre você (opcional)</Label>
          <Textarea
            id="bio"
            rows={4}
            placeholder="Experiência, especialidades, diferenciais..."
            {...register('bio')}
          />
          <p className="text-xs text-muted-foreground">
            Você poderá editar e completar isso depois no seu painel.
          </p>
        </div>
      </fieldset>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-zello-600"
          {...register('accept')}
        />
        <span className="text-muted-foreground">
          Aceito os Termos de uso, Política de Privacidade e a taxa de 20% por venda concluída.
        </span>
      </label>
      {errors.accept ? <p className="text-xs text-destructive">{errors.accept.message}</p> : null}

      <Button type="submit" size="xl" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          <>
            Criar conta e continuar
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Próximo passo: enviar documentos para verificação (KYC).
      </p>
    </form>
  );
}
