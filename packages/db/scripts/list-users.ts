import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const filter = process.argv[2];
  const users = await prisma.user.findMany({
    where: filter
      ? {
          OR: [
            { email: { contains: filter, mode: 'insensitive' } },
            { name: { contains: filter, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      professional: { select: { id: true, slug: true } },
      _count: {
        select: {
          clientBookings: true,
          reviewsWritten: true,
          notifications: true,
          documents: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total: ${users.length}\n`);
  for (const u of users) {
    console.log(
      [
        u.id,
        u.email,
        u.role,
        u.kycStatus,
        u.status,
        u.professional ? `pro=${u.professional.slug ?? u.professional.id}` : '',
        `bookings=${u._count.clientBookings}`,
        `reviews=${u._count.reviewsWritten}`,
        `docs=${u._count.documents}`,
        u.createdAt.toISOString().slice(0, 10),
      ]
        .filter(Boolean)
        .join(' | '),
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
