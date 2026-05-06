import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta na Zello Conecta.',
};

export default function EntrarPage() {
  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua conta para gerenciar reservas e serviços."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="font-medium text-zello-600 hover:underline">
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
