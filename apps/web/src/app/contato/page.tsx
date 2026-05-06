import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { ContactForm } from '@/components/sections/contact-form';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Fale com a Zello Conecta: dúvidas, parcerias, imprensa, suporte ou carreiras. Respondemos em até 1 dia útil.',
};

const channels = [
  { icon: Mail, label: 'Email', value: 'contato@zelloconecta.com.br', href: 'mailto:contato@zelloconecta.com.br' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+55 (11) 90000-0000', href: 'https://wa.me/5511900000000' },
  { icon: Phone, label: 'Suporte', value: '0800 000 0000', href: 'tel:08000000000' },
  { icon: MapPin, label: 'Endereço', value: 'São Paulo, SP — Brasil' },
];

export default function ContatoPage({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string }>;
}) {
  return (
    <main>
      <PageHero
        eyebrow="Contato"
        title="Vamos conversar"
        description="Conta com a gente para qualquer assunto. Em geral, respondemos em até 1 dia útil. Para urgências de pagamento ou disputa, use o app — equipe dedicada."
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-2xl font-bold tracking-tight">Canais diretos</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Preferes outro canal? Aqui estão nossas formas de contato:
              </p>

              <div className="mt-8 space-y-3">
                {channels.map((c) => (
                  <Card key={c.label} className="hover:border-zello-200">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zello-50 text-zello-600">
                        <c.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {c.label}
                        </div>
                        {c.href ? (
                          <a
                            href={c.href}
                            className="block truncate text-sm font-medium hover:text-zello-600"
                            target={c.href.startsWith('http') ? '_blank' : undefined}
                            rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {c.value}
                          </a>
                        ) : (
                          <div className="text-sm font-medium">{c.value}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-zello-200 bg-zello-50/50 p-5">
                <h3 className="text-sm font-semibold">Imprensa</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Para entrevistas, kits de imprensa ou parcerias de mídia, use o assunto{' '}
                  <strong>Imprensa</strong> no formulário ou escreva para{' '}
                  <a href="mailto:imprensa@zelloconecta.com.br" className="text-zello-600 hover:underline">
                    imprensa@zelloconecta.com.br
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold tracking-tight">Envie uma mensagem</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Preencha o formulário e nossa equipe responde no email informado.
                  </p>
                  <div className="mt-8">
                    <ContactFormWrapper searchParams={searchParams} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

async function ContactFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string }>;
}) {
  const { assunto } = await searchParams;
  const validSubjects = ['duvida', 'parceria', 'imprensa', 'carreiras', 'suporte', 'outro'] as const;
  const defaultSubject = validSubjects.includes(assunto as (typeof validSubjects)[number])
    ? (assunto as (typeof validSubjects)[number])
    : 'duvida';
  return <ContactForm defaultSubject={defaultSubject} />;
}
