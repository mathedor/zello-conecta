import { PrismaClient, type Weekday, type LocationMode, type PriceMode } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const u = (id: string, params = '') =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop${params}`;

interface DemoService {
  title: string;
  description: string;
  priceMode: PriceMode;
  price: number;
  durationMin: number;
  locationMode: LocationMode;
  categorySlug: string;
  photos: string[];
}

interface DemoPro {
  email: string;
  password: string;
  name: string;
  cpf: string;
  phone: string;
  slug: string;
  headline: string;
  bio: string;
  city: string;
  state: string;
  averageRating: number;
  totalReviews: number;
  totalCompleted: number;
  services: DemoService[];
}

const DAYS: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

const PROS: DemoPro[] = [
  {
    email: 'joana.silva@demo.zelloconecta.com.br',
    password: 'demo12345',
    name: 'Joana Silva',
    cpf: '11111111111',
    phone: '+5511900000001',
    slug: 'joana-silva',
    headline: 'Advogada — Direito do Trabalho e Cível',
    bio: '12 anos de atuação na advocacia trabalhista e cível. Especializada em consultoria preventiva, revisão contratual e acompanhamento processual. OAB/SP em dia. Atendo presencial em São Paulo e remoto para todo o Brasil.',
    city: 'São Paulo',
    state: 'SP',
    averageRating: 4.8,
    totalReviews: 23,
    totalCompleted: 47,
    services: [
      {
        title: 'Consultoria trabalhista preventiva',
        description:
          'Atendimento online ou presencial para análise de relação de trabalho, esclarecimento de dúvidas, orientação sobre direitos e deveres. Indicado para profissionais autônomos, CLT e empresas que querem evitar passivos. Inclui resposta por escrito com recomendações.',
        priceMode: 'HOURLY',
        price: 250,
        durationMin: 60,
        locationMode: 'BOTH',
        categorySlug: 'advocacia',
        photos: [u('1589829085413-56de8ae18c73'), u('1521791136064-7986c2920216')],
      },
      {
        title: 'Revisão completa de contrato',
        description:
          'Análise integral de contrato existente (de trabalho, prestação de serviços, locação, parceria etc.) com parecer escrito de até 4 páginas, sugestões de cláusulas e pontos de atenção. Entrega em até 5 dias úteis.',
        priceMode: 'FIXED',
        price: 800,
        durationMin: 240,
        locationMode: 'REMOTE',
        categorySlug: 'advocacia',
        photos: [u('1505664194779-8beaceb93744'), u('1450101499163-c8848c66ca85')],
      },
      {
        title: 'Acompanhamento de audiência',
        description:
          'Representação e suporte em audiências trabalhistas e cíveis na grande São Paulo. Inclui preparação prévia, acompanhamento da sessão e relatório pós-audiência.',
        priceMode: 'HOURLY',
        price: 350,
        durationMin: 60,
        locationMode: 'ON_SITE',
        categorySlug: 'advocacia',
        photos: [u('1521587760476-6c12a4b040da')],
      },
    ],
  },
  {
    email: 'pedro.almeida@demo.zelloconecta.com.br',
    password: 'demo12345',
    name: 'Pedro Almeida',
    cpf: '22222222222',
    phone: '+5531900000002',
    slug: 'pedro-almeida',
    headline: 'Eletricista residencial e predial — 15 anos',
    bio: 'Eletricista com 15 anos de experiência em residências, comércios e prédios. Especializado em instalações de baixa tensão, reparos emergenciais e adequação de quadros elétricos. Atendo Belo Horizonte e região metropolitana com nota fiscal e garantia de 90 dias.',
    city: 'Belo Horizonte',
    state: 'MG',
    averageRating: 4.9,
    totalReviews: 38,
    totalCompleted: 62,
    services: [
      {
        title: 'Instalação elétrica residencial',
        description:
          'Instalação de tomadas, interruptores, luminárias e chuveiros. Inclui troca de fios antigos quando necessário. Material por conta do cliente ou orçamento separado.',
        priceMode: 'HOURLY',
        price: 180,
        durationMin: 120,
        locationMode: 'ON_SITE',
        categorySlug: 'reformas',
        photos: [u('1621905251189-08b45d6a269e'), u('1473341304170-971dccb5ac1e')],
      },
      {
        title: 'Reparo emergencial 24h',
        description:
          'Atendimento expresso para curto-circuito, queda de energia, ponto que não funciona. Diagnóstico e reparo no mesmo dia em até 90 minutos. Disponível 24h em BH.',
        priceMode: 'FIXED',
        price: 350,
        durationMin: 90,
        locationMode: 'ON_SITE',
        categorySlug: 'reformas',
        photos: [u('1581094022024-6e3e8e39c39e'), u('1530124566582-a618bc2615dc')],
      },
      {
        title: 'Análise de quadro elétrico',
        description:
          'Verificação completa do quadro de distribuição: disjuntores, dimensionamento, aterramento e DR. Entrega de relatório com recomendações.',
        priceMode: 'FIXED',
        price: 250,
        durationMin: 60,
        locationMode: 'ON_SITE',
        categorySlug: 'reformas',
        photos: [u('1558618666-fcd25c85cd64')],
      },
    ],
  },
  {
    email: 'camila.santos@demo.zelloconecta.com.br',
    password: 'demo12345',
    name: 'Camila Santos',
    cpf: '33333333333',
    phone: '+5521900000003',
    slug: 'camila-santos',
    headline: 'Designer UX/UI — Identidade visual e produtos digitais',
    bio: 'Designer com 8 anos de experiência. Atendi mais de 80 marcas e 30 produtos digitais. Especialista em criação de identidade visual completa e UX para SaaS e apps mobile. Trabalho 100% remoto.',
    city: 'Rio de Janeiro',
    state: 'RJ',
    averageRating: 4.7,
    totalReviews: 19,
    totalCompleted: 32,
    services: [
      {
        title: 'Identidade visual completa',
        description:
          'Criação de logo, paleta de cores, tipografia, manual de marca em PDF, aplicações em redes sociais, papelaria digital e versões para impressão. Entrega em 7 a 10 dias úteis com até 3 rodadas de ajustes.',
        priceMode: 'FIXED',
        price: 1500,
        durationMin: 240,
        locationMode: 'REMOTE',
        categorySlug: 'design',
        photos: [u('1561070791-2526d30994b8'), u('1542744173-8e7e53415bb0')],
      },
      {
        title: 'Auditoria UX',
        description:
          'Análise heurística de 1 produto digital (site, app, SaaS) com relatório priorizado, screenshots anotados e sugestões acionáveis. Inclui sessão de 1h para apresentação dos achados.',
        priceMode: 'HOURLY',
        price: 180,
        durationMin: 120,
        locationMode: 'REMOTE',
        categorySlug: 'design',
        photos: [u('1498050108023-c5249f4df085'), u('1611532736597-de2d4265fba3')],
      },
      {
        title: 'Wireframes para app mobile',
        description:
          'Criação de wireframes de até 8 telas em Figma, alinhados em 1 sessão de discovery. Entrega em 5 dias úteis. Ideal para validação antes de desenvolver.',
        priceMode: 'FIXED',
        price: 800,
        durationMin: 240,
        locationMode: 'REMOTE',
        categorySlug: 'design',
        photos: [u('1626785774573-4b799315345d')],
      },
    ],
  },
  {
    email: 'lucas.ferreira@demo.zelloconecta.com.br',
    password: 'demo12345',
    name: 'Lucas Ferreira',
    cpf: '44444444444',
    phone: '+5541900000004',
    slug: 'lucas-ferreira',
    headline: 'Personal Trainer — Hipertrofia e condicionamento',
    bio: 'CREF ativo, formado em Educação Física há 10 anos. Atendo na sua casa, academia ou online com programas personalizados focados em resultado. Especialista em hipertrofia e condicionamento aeróbico.',
    city: 'Curitiba',
    state: 'PR',
    averageRating: 4.95,
    totalReviews: 41,
    totalCompleted: 89,
    services: [
      {
        title: 'Acompanhamento personalizado',
        description:
          'Sessão de treino personalizada com orientação técnica, correção postural e ajustes contínuos no plano. Pode ser na sua casa (com peso corporal e equipamentos básicos) ou em academia parceira.',
        priceMode: 'HOURLY',
        price: 120,
        durationMin: 60,
        locationMode: 'BOTH',
        categorySlug: 'saude-bem-estar',
        photos: [u('1571019613454-1cb2f99b2d8b'), u('1534438327276-14e5300c3a48')],
      },
      {
        title: 'Avaliação física completa',
        description:
          'Avaliação completa: composição corporal, medidas, testes funcionais e relatório com objetivos e plano de 12 semanas. Inclui análise de mobilidade e postura.',
        priceMode: 'FIXED',
        price: 250,
        durationMin: 90,
        locationMode: 'ON_SITE',
        categorySlug: 'saude-bem-estar',
        photos: [u('1576678927484-cc907957088c')],
      },
      {
        title: 'Plano de treino mensal online',
        description:
          'Plano completo entregue por app, com vídeos demonstrativos, ajustes semanais por mensagem e 1 sessão online de revisão por mês.',
        priceMode: 'FIXED',
        price: 480,
        durationMin: 60,
        locationMode: 'REMOTE',
        categorySlug: 'saude-bem-estar',
        photos: [u('1599058917765-a780eda07a3e'), u('1581009146145-b5ef050c2e1e')],
      },
    ],
  },
];

async function ensureCategory(slug: string) {
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) throw new Error(`Categoria ${slug} não encontrada — rode o seed base primeiro.`);
  return cat;
}

async function main() {
  console.log('Seed: 4 profissionais demo...');
  const passwordHash = await bcrypt.hash('demo12345', 10);

  for (const p of PROS) {
    const cpfClean = p.cpf;

    let user = await prisma.user.findUnique({ where: { email: p.email } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { kycStatus: 'APPROVED', status: 'ACTIVE', passwordHash },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: p.email,
          name: p.name,
          phone: p.phone,
          cpf: cpfClean,
          passwordHash,
          role: 'PROFESSIONAL',
          kycStatus: 'APPROVED',
          status: 'ACTIVE',
        },
      });
    }

    const professional = await prisma.professional.upsert({
      where: { userId: user.id },
      update: {
        slug: p.slug,
        headline: p.headline,
        bio: p.bio,
        city: p.city,
        state: p.state,
        averageRating: p.averageRating,
        totalReviews: p.totalReviews,
        totalCompleted: p.totalCompleted,
        totalBookings: p.totalCompleted,
      },
      create: {
        userId: user.id,
        slug: p.slug,
        headline: p.headline,
        bio: p.bio,
        city: p.city,
        state: p.state,
        averageRating: p.averageRating,
        totalReviews: p.totalReviews,
        totalCompleted: p.totalCompleted,
        totalBookings: p.totalCompleted,
      },
    });

    await prisma.servicePhoto.deleteMany({
      where: { service: { professionalId: professional.id } },
    });
    await prisma.service.deleteMany({ where: { professionalId: professional.id } });

    for (const [i, svc] of p.services.entries()) {
      const cat = await ensureCategory(svc.categorySlug);
      const baseSlug = `${svc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.slug}`;
      const slug = baseSlug.slice(0, 80);
      await prisma.service.create({
        data: {
          professionalId: professional.id,
          categoryId: cat.id,
          title: svc.title,
          slug,
          description: svc.description,
          priceMode: svc.priceMode,
          price: svc.price,
          durationMin: svc.durationMin,
          locationMode: svc.locationMode,
          active: true,
          photos: {
            create: svc.photos.map((url, idx) => ({ url, order: idx })),
          },
        },
      });
      void i;
    }

    await prisma.schedule.deleteMany({ where: { professionalId: professional.id } });
    for (const day of DAYS) {
      await prisma.schedule.createMany({
        data: [
          { professionalId: professional.id, weekday: day, startTime: '08:00', endTime: '12:00' },
          { professionalId: professional.id, weekday: day, startTime: '14:00', endTime: '18:00' },
        ],
      });
    }

    console.log(`✓ ${p.name} (${p.slug}) — ${p.services.length} serviços`);
  }

  console.log('\nProntos! Acesse https://zello-conecta.vercel.app/buscar');
  console.log('Logins demo (senha "demo12345"):');
  PROS.forEach((p) => console.log(`  ${p.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
