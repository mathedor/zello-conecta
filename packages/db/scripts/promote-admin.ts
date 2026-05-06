import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] ?? 'Admin';

  if (!email || !password) {
    console.error('Usage: tsx scripts/promote-admin.ts <email> <password> [name]');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      role: 'ADMIN',
      passwordHash,
      kycStatus: 'APPROVED',
      status: 'ACTIVE',
    },
    create: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: 'ADMIN',
      kycStatus: 'APPROVED',
      status: 'ACTIVE',
    },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log('Admin pronto:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
