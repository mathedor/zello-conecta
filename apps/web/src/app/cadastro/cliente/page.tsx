import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { ClientSignupForm } from './signup-form';

export const metadata = {
  title: 'Criar conta de cliente',
  description: 'Cadastre-se para contratar serviços profissionais.',
} as Metadata;

export default function CadastroClientePage() {
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
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Mudar tipo de cadastro
          </Link>
        </>
      }
    >
      <ClientSignupForm />
    </AuthShell>
  );
}
