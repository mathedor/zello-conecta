import Link from 'next/link';
import {
  Briefcase,
  Hammer,
  Heart,
  Laptop,
  LucideIcon,
  Palette,
  PartyPopper,
  Scale,
  Sparkle,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

const categories: Array<{ slug: string; name: string; icon: LucideIcon; description: string }> = [
  { slug: 'advocacia', name: 'Advocacia', icon: Scale, description: 'Consultoria jurídica, contratos e processos.' },
  { slug: 'beleza-estetica', name: 'Beleza e Estética', icon: Sparkles, description: 'Cabelo, maquiagem, estética facial e corporal.' },
  { slug: 'reformas', name: 'Reformas', icon: Hammer, description: 'Pedreiros, pintores, eletricistas e encanadores.' },
  { slug: 'tecnologia', name: 'Tecnologia', icon: Laptop, description: 'Desenvolvimento, suporte de TI e redes.' },
  { slug: 'saude-bem-estar', name: 'Saúde e Bem-estar', icon: Heart, description: 'Massagem, fisioterapia, nutrição e personal.' },
  { slug: 'aulas', name: 'Aulas e Cursos', icon: GraduationCap, description: 'Aulas particulares, idiomas e reforço escolar.' },
  { slug: 'eventos', name: 'Eventos', icon: PartyPopper, description: 'Cerimonialistas, fotógrafos, DJs e buffet.' },
  { slug: 'limpeza', name: 'Limpeza', icon: Sparkle, description: 'Diaristas, limpeza pesada e organização.' },
  { slug: 'consultoria', name: 'Consultoria', icon: Briefcase, description: 'Negócios, finanças, marketing e RH.' },
  { slug: 'design', name: 'Design e Criação', icon: Palette, description: 'Identidade visual, ilustração e UX.' },
];

export function CategoriesSection() {
  return (
    <section className="bg-secondary/30 py-20 md:py-28">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-zello-600">
              Para qualquer setor
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Categorias populares
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Do advogado ao encanador, do designer ao personal. Profissionais de qualquer área
              podem oferecer serviços por hora ou por empreitada.
            </p>
          </div>
          <Link
            href="/buscar"
            className="text-sm font-medium text-zello-600 hover:text-zello-700"
          >
            Ver todas as categorias →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/buscar?categoria=${cat.slug}`}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-zello-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zello-50 text-zello-600 transition-colors group-hover:bg-zello-600 group-hover:text-white">
                <cat.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-tight">{cat.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
