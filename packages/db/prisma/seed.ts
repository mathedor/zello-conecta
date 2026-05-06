import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = 'admin@zelloconecta.com.br';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrador',
      role: Role.ADMIN,
      kycStatus: 'APPROVED',
    },
  });

  const baseCategories = [
    { slug: 'advocacia', name: 'Advocacia', iconName: 'scale' },
    { slug: 'beleza-estetica', name: 'Beleza e Estética', iconName: 'sparkles' },
    { slug: 'reformas', name: 'Reformas e Construção', iconName: 'hammer' },
    { slug: 'tecnologia', name: 'Tecnologia', iconName: 'laptop' },
    { slug: 'saude-bem-estar', name: 'Saúde e Bem-estar', iconName: 'heart-pulse' },
    { slug: 'aulas', name: 'Aulas e Cursos', iconName: 'graduation-cap' },
    { slug: 'eventos', name: 'Eventos e Festas', iconName: 'party-popper' },
    { slug: 'limpeza', name: 'Limpeza', iconName: 'sparkle' },
    { slug: 'consultoria', name: 'Consultoria', iconName: 'briefcase' },
    { slug: 'design', name: 'Design e Criação', iconName: 'palette' },
  ];

  for (const cat of baseCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, approved: true },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
