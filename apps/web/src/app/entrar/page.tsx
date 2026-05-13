import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta na Zello Conecta.',
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const cadastroHref = next ? `/cadastro?next=${encodeURIComponent(next)}` : '/cadastro';
  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua conta para gerenciar reservas e serviços."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link href={cadastroHref} className="font-medium text-zello-600 hover:underline">
            Cadastre-se grátis
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
