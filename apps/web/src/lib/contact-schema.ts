import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(120, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('')),
  subject: z.enum(['duvida', 'parceria', 'imprensa', 'carreiras', 'suporte', 'outro'], {
    message: 'Selecione um assunto',
  }),
  message: z
    .string()
    .min(20, 'Mensagem muito curta — descreva pelo menos 20 caracteres')
    .max(5000, 'Mensagem muito longa'),
  honeypot: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const subjectLabels: Record<ContactInput['subject'], string> = {
  duvida: 'Dúvida geral',
  parceria: 'Parceria comercial',
  imprensa: 'Imprensa',
  carreiras: 'Carreiras',
  suporte: 'Suporte',
  outro: 'Outro',
};
