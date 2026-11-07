import { z } from 'zod';
import { parseNumber } from '@/utils/format';

export const entrySchema = z.object({
  type: z.enum(['RECEIVABLE', 'PAYABLE']),
  description: z.string().trim().min(3, 'Descreva o lançamento'),
  category: z.string().min(1, 'Escolha a categoria'),
  amount: z.string().refine((v) => (parseNumber(v) ?? 0) > 0, 'Informe um valor maior que zero'),
  dueDate: z.string().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), 'Use o formato AAAA-MM-DD'),
  vehicleId: z.string(),
});

export type EntryFormInput = z.infer<typeof entrySchema>;
