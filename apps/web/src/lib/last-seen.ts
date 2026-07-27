import { prisma } from '@zello/db';

/**
 * Marca presença do usuário (online_agora do pulso da Ana).
 * Fire-and-forget: um único UPDATE, e só se a última marcação tiver mais de 5 min.
 * Nunca lança — presença não pode derrubar layout.
 */
export function touchLastSeen(userId: string | undefined | null): void {
  if (!userId) return;
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  void prisma.user
    .updateMany({
      where: { id: userId, OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: fiveMinAgo } }] },
      data: { lastSeenAt: new Date() },
    })
    .catch(() => {});
}
