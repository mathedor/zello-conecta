import { z } from 'zod';

const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
const phoneRegex = /^\+?\d{10,14}$/;

export const signupClientSchema = z
  .object({
    name: z.string().min(2, 'Nome muito curto').max(120),
    email: z.string().email('Email inválido').toLowerCase(),
    password: z.string().min(8, 'Mínimo 8 caracteres').max(72),
    confirmPassword: z.string(),
    phone: z.string().regex(phoneRegex, 'Telefone inválido').optional().or(z.literal('')),
    accept: z.literal(true, { message: 'É necessário aceitar os termos' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

export const signupProSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(72),
    confirmPassword: z.string(),
    phone: z.string().regex(phoneRegex, 'Telefone inválido'),
    cpf: z.string().regex(cpfRegex, 'CPF inválido'),
    headline: z.string().min(3, 'Mínimo 3 caracteres').max(120),
    bio: z.string().max(2000).optional().or(z.literal('')),
    city: z.string().min(2, 'Informe sua cidade').max(80),
    state: z.string().length(2, 'Use a sigla, ex: SP'),
    accept: z.literal(true, { message: 'É necessário aceitar os termos' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const forgotSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8).max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

export const kycSubmitSchema = z.object({
  documents: z
    .array(
      z.object({
        type: z.enum([
          'CPF_FRONT',
          'CPF_BACK',
          'RG_FRONT',
          'RG_BACK',
          'CNH',
          'SELFIE',
          'PROOF_OF_ADDRESS',
          'CNPJ_CARD',
          'OTHER',
        ]),
        url: z.string().url(),
      }),
    )
    .min(1)
    .max(8),
});

export type SignupClientInput = z.infer<typeof signupClientSchema>;
export type SignupProInput = z.infer<typeof signupProSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotInput = z.infer<typeof forgotSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type KycSubmitInput = z.infer<typeof kycSubmitSchema>;
