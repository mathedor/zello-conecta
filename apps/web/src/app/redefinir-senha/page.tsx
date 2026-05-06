import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetForm } from './reset-form';

export const metadata: Metadata = {
  title: 'Redefinir senha',
};

export default function RedefinirSenhaPage() {
  return (
    <AuthShell
      title="Nova senha"
      description="Escolha uma senha forte para proteger sua conta."
      footer={
        <>
          Lembrou da senha?{' '}
          <Link href="/entrar" className="font-medium text-zello-600 hover:underline">
            Voltar ao login
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
