import { z } from 'zod';
import { CASE_TYPES } from '@/constants/aftersales';

export const caseSchema = z.object({
  type: z.enum(CASE_TYPES as [string, ...string[]]),
  title: z.string().trim().min(3, 'Informe o assunto'),
  description: z.string().trim(),
  customerName: z.string().trim().min(3, 'Informe o cliente'),
  vehicleLabel: z.string().trim().min(2, 'Informe o veículo'),
  dueDate: z.string().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), 'Use o formato AAAA-MM-DD'),
});

export type CaseFormInput = z.infer<typeof caseSchema>;
