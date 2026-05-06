import { z } from 'zod';

export const adminUserUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().toLowerCase().optional(),
  phone: z.string().max(20).optional().or(z.literal('')),
  role: z.enum(['CLIENT', 'PROFESSIONAL', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  kycStatus: z.enum(['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED']).optional(),
  city: z.string().max(80).optional().or(z.literal('')),
  state: z.string().max(2).optional().or(z.literal('')),
  headline: z.string().max(120).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
});

export type AdminUserUpdate = z.infer<typeof adminUserUpdateSchema>;

export const adminNotifySchema = z.object({
  title: z.string().min(2).max(120),
  body: z.string().min(2).max(2000),
});
export type AdminNotify = z.infer<typeof adminNotifySchema>;
