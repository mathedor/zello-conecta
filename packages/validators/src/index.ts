import { z } from 'zod';

export const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
export const cnpjRegex = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;
export const phoneRegex = /^\+?\d{10,14}$/;
export const cepRegex = /^\d{5}-?\d{3}$/;

export const signupClientSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(120),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  phone: z.string().regex(phoneRegex, 'Telefone inválido').optional(),
  cpf: z.string().regex(cpfRegex, 'CPF inválido').optional(),
});

export const signupProfessionalSchema = signupClientSchema.extend({
  cpf: z.string().regex(cpfRegex, 'CPF obrigatório'),
  cnpj: z.string().regex(cnpjRegex, 'CNPJ inválido').optional(),
  headline: z.string().min(3).max(120),
  bio: z.string().max(2000).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const addressSchema = z.object({
  zipCode: z.string().regex(cepRegex, 'CEP inválido'),
  street: z.string().min(1),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  country: z.string().default('BR'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  reference: z.string().optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(5000),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  newCategoryName: z.string().optional(),
  priceMode: z.enum(['HOURLY', 'FIXED']),
  price: z.number().positive(),
  durationMin: z.number().int().positive(),
  locationMode: z.enum(['ON_SITE', 'PROFESSIONAL_LOCATION', 'REMOTE', 'BOTH']),
  active: z.boolean().default(true),
  photos: z.array(z.string().url()).max(10).optional(),
});

export const scheduleSchema = z.object({
  weekday: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida'),
});

export const scheduleBlockSchema = z.object({
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  reason: z.string().max(200).optional(),
});

export const bookingSchema = z.object({
  serviceId: z.string(),
  scheduledAt: z.coerce.date(),
  locationMode: z.enum(['ON_SITE', 'PROFESSIONAL_LOCATION', 'REMOTE']),
  serviceAddress: addressSchema.optional(),
  notesFromClient: z.string().max(1000).optional(),
});

export const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const disputeSchema = z.object({
  bookingId: z.string(),
  reason: z.string().min(20).max(2000),
});

export const withdrawSchema = z.object({
  amount: z.number().positive(),
  pixKey: z.string().min(1),
  pixKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']),
});

export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  radius: z.coerce.number().int().min(1).max(200).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
});

export type SignupClientInput = z.infer<typeof signupClientSchema>;
export type SignupProfessionalInput = z.infer<typeof signupProfessionalSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
