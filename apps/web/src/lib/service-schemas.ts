import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const serviceBaseSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(120),
  description: z.string().min(20, 'Descrição deve ter ao menos 20 caracteres').max(5000),
  priceMode: z.enum(['HOURLY', 'FIXED']),
  price: z.coerce.number().positive('Preço inválido'),
  durationMin: z.coerce.number().int().positive('Duração inválida').max(24 * 60),
  locationMode: z.enum(['ON_SITE', 'PROFESSIONAL_LOCATION', 'REMOTE', 'BOTH']),
  active: z.coerce.boolean().default(true),
  categoryId: z.string().nullable().optional(),
  newCategoryName: z.string().min(2).max(60).optional().or(z.literal('')),
  photos: z.array(z.string().url()).max(10).default([]),
});

export const serviceCreateSchema = serviceBaseSchema.refine(
  (d) => d.categoryId || (d.newCategoryName && d.newCategoryName.length > 0),
  {
    path: ['categoryId'],
    message: 'Selecione uma categoria ou sugira uma nova',
  },
);

export const serviceUpdateSchema = serviceBaseSchema.partial();

export type ServiceCreateInput = z.infer<typeof serviceBaseSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;

export const scheduleSlotSchema = z
  .object({
    weekday: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
    startTime: z.string().regex(timeRegex, 'Hora inválida (HH:MM)'),
    endTime: z.string().regex(timeRegex, 'Hora inválida (HH:MM)'),
  })
  .refine((d) => d.startTime < d.endTime, {
    path: ['endTime'],
    message: 'Fim deve ser posterior ao início',
  });

export const scheduleReplaceSchema = z.object({
  slots: z.array(scheduleSlotSchema).max(50),
});

export const blockCreateSchema = z
  .object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    reason: z.string().max(200).optional().or(z.literal('')),
  })
  .refine((d) => d.endsAt > d.startsAt, {
    path: ['endsAt'],
    message: 'Fim deve ser posterior ao início',
  });

export type ScheduleSlot = z.infer<typeof scheduleSlotSchema>;
export type ScheduleReplaceInput = z.infer<typeof scheduleReplaceSchema>;
export type BlockCreateInput = z.infer<typeof blockCreateSchema>;

export const WEEKDAYS: Array<{ key: ScheduleSlot['weekday']; label: string; short: string }> = [
  { key: 'MON', label: 'Segunda', short: 'Seg' },
  { key: 'TUE', label: 'Terça', short: 'Ter' },
  { key: 'WED', label: 'Quarta', short: 'Qua' },
  { key: 'THU', label: 'Quinta', short: 'Qui' },
  { key: 'FRI', label: 'Sexta', short: 'Sex' },
  { key: 'SAT', label: 'Sábado', short: 'Sáb' },
  { key: 'SUN', label: 'Domingo', short: 'Dom' },
];

export const PRICE_MODE_LABELS: Record<'HOURLY' | 'FIXED', string> = {
  HOURLY: 'Por hora',
  FIXED: 'Empreitada',
};

export const LOCATION_MODE_LABELS: Record<'ON_SITE' | 'PROFESSIONAL_LOCATION' | 'REMOTE' | 'BOTH', string> = {
  ON_SITE: 'No local do cliente',
  PROFESSIONAL_LOCATION: 'No meu local',
  REMOTE: 'Remoto / online',
  BOTH: 'Cliente ou meu local',
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
