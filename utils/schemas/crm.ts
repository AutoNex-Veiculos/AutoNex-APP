import { z } from 'zod';
import { LEAD_SOURCES } from '@/constants/crm';

const digits = (v: string) => v.replace(/\D/g, '');

export const leadSchema = z.object({
  name: z.string().trim().min(3, 'Informe o nome do cliente'),
  type: z.enum(['PERSON', 'COMPANY']),
  document: z.string().trim().refine((v) => v === '' || [11, 14].includes(digits(v).length), 'CPF ou CNPJ inválido'),
  phone: z.string().trim().refine((v) => [10, 11].includes(digits(v).length), 'Informe o telefone com DDD'),
  email: z.string().trim().refine((v) => v === '' || /^\S+@\S+\.\S+$/.test(v), 'E-mail inválido'),
  source: z.enum(LEAD_SOURCES as [string, ...string[]]),
  vehicleId: z.string(),
  note: z.string().trim(),
});

export const noteSchema = z.object({ text: z.string().trim().min(2, 'Escreva a anotação') });

export type LeadFormInput = z.infer<typeof leadSchema>;
export type NoteFormInput = z.infer<typeof noteSchema>;
