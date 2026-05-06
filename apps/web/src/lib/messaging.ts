import { z } from 'zod';

export const startConversationSchema = z.object({
  professionalId: z.string().min(1),
  body: z.string().min(1, 'Mensagem vazia').max(2000, 'Máximo 2000 caracteres'),
  bookingId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1, 'Mensagem vazia').max(2000, 'Máximo 2000 caracteres'),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
