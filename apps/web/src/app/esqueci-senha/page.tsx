import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotForm } from './forgot-form';

export const metadata: Metadata = {
  title: 'Esqueci a senha',
};

export default function EsqueciSenhaPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      description="Informe seu email cadastrado e enviaremos um link para redefinir sua senha."
      footer={
        <>
          Lembrou?{' '}
          <Link href="/entrar" className="font-medium text-zello-600 hover:underline">
            Voltar ao login
          </Link>
        </>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
