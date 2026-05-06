import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ProSignupForm } from './pro-signup-form';

export const metadata: Metadata = {
  title: 'Cadastro profissional',
  description: 'Crie sua conta de profissional na Zello Conecta. Cadastro gratuito.',
};

export default function ProSignupWizard() {
  return (
    <main className="container py-10 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-zello-600">
            Cadastro profissional
          </p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Crie sua conta em poucos minutos
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Após o cadastro você fará a verificação de identidade (KYC) e poderá criar serviços.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <ProSignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/entrar" className="font-medium text-zello-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
