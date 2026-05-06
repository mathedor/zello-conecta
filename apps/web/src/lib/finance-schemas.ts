import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Mínimo 1 estrela').max(5, 'Máximo 5 estrelas'),
  comment: z.string().max(2000).optional().or(z.literal('')),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

const pixKeyTypes = ['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM'] as const;

export const payoutAccountSchema = z.object({
  pixKey: z.string().min(3, 'Chave PIX inválida').max(140),
  pixKeyType: z.enum(pixKeyTypes),
  bankName: z.string().max(120).optional().or(z.literal('')),
  bankCode: z.string().max(10).optional().or(z.literal('')),
  agency: z.string().max(20).optional().or(z.literal('')),
  account: z.string().max(30).optional().or(z.literal('')),
  accountType: z.enum(['CC', 'CP']).optional().or(z.literal('')),
  holderName: z.string().min(2, 'Nome do titular obrigatório').max(120),
  holderDoc: z.string().max(20).optional().or(z.literal('')),
});
export type PayoutAccountInput = z.infer<typeof payoutAccountSchema>;

export const MIN_WITHDRAW = 20;

export const withdrawSchema = z.object({
  amount: z.coerce.number().positive(),
});
export type WithdrawInput = z.infer<typeof withdrawSchema>;

export const adminWithdrawApproveSchema = z.object({
  receiptUrl: z.string().url('Comprovante inválido'),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const adminWithdrawRejectSchema = z.object({
  reason: z.string().min(10).max(500),
});

export const PIX_KEY_TYPE_LABELS: Record<(typeof pixKeyTypes)[number], string> = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  EMAIL: 'Email',
  PHONE: 'Telefone',
  RANDOM: 'Chave aleatória',
};
