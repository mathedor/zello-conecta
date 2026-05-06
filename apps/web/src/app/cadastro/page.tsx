import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ClientSignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Cadastrar',
  description: 'Crie sua conta gratuita na Zello Conecta para contratar serviços.',
};

export default function CadastroPage() {
  return (
    <AuthShell
      title="Criar conta"
      description="Cadastre-se em segundos e comece a contratar profissionais com pagamento seguro."
      footer={
        <>
          Já tem conta?{' '}
          <Link href="/entrar" className="font-medium text-zello-600 hover:underline">
            Entrar
          </Link>
          {' · '}
          Quer oferecer serviços?{' '}
          <Link href="/cadastro/profissional" className="font-medium text-zello-600 hover:underline">
            Cadastro profissional
          </Link>
        </>
      }
    >
      <ClientSignupForm />
    </AuthShell>
  );
}
