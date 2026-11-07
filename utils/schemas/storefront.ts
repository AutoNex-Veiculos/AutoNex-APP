import { z } from 'zod';

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2, 'Informe o nome da loja'),
  slug: z.string().trim().regex(/^[a-z0-9-]{3,40}$/, 'Use de 3 a 40 letras minúsculas, números ou hífens'),
  whatsapp: z.string().trim().refine((v) => v === '' || [10, 11].includes(v.replace(/\D/g, '').length), 'Informe o WhatsApp com DDD'),
  about: z.string().trim(),
  published: z.boolean(),
});

export const interestSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome'),
  phone: z.string().trim().refine((v) => [10, 11].includes(v.replace(/\D/g, '').length), 'Informe o telefone com DDD'),
  message: z.string().trim(),
  vehicleId: z.string(),
});

export type SettingsFormInput = z.infer<typeof settingsSchema>;
export type InterestFormInput = z.infer<typeof interestSchema>;
