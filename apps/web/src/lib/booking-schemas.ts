import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida'),
  notes: z.string().max(1000).optional(),
});

export const pixChargeSchema = z.object({
  bookingId: z.string().min(1),
});

export const cardChargeSchema = z.object({
  bookingId: z.string().min(1),
  paymentToken: z.string().min(8),
  installments: z.coerce.number().int().min(1).max(12).default(1),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type PixChargeBody = z.infer<typeof pixChargeSchema>;
export type CardChargeBody = z.infer<typeof cardChargeSchema>;
