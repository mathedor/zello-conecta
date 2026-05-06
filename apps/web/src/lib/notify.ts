import { prisma, type NotificationType, type NotificationChannel } from '@zello/db';

export interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  channel?: NotificationChannel;
  bookingId?: string;
  metadata?: Record<string, unknown>;
}

export async function notify(input: NotifyInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        channel: input.channel ?? 'IN_APP',
        title: input.title,
        body: input.body,
        bookingId: input.bookingId ?? null,
        metadata: (input.metadata as never) ?? undefined,
        sentAt: new Date(),
      },
    });
  } catch (err) {
    console.error('[notify] erro ao criar notificação', err);
  }
}

export async function notifyMany(inputs: NotifyInput[]) {
  await Promise.allSettled(inputs.map(notify));
}
