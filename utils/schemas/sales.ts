import { z } from 'zod';
import { PAYMENT_CONDITIONS } from '@/constants/sales';
import { parseNumber } from '@/utils/format';

export const proposalSchema = z.object({
  customerId: z.string().min(1, 'Escolha o cliente'),
  vehicleId: z.string().min(1, 'Escolha o veículo'),
  offeredValue: z.string().refine((v) => (parseNumber(v) ?? 0) > 0, 'Informe o valor da proposta'),
  paymentCondition: z.enum(PAYMENT_CONDITIONS as [string, ...string[]]),
  tradeIn: z.string().trim(),
  validUntil: z
    .string()
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), 'Use o formato AAAA-MM-DD')
    .refine((v) => v >= new Date().toISOString().slice(0, 10), 'A validade não pode estar no passado'),
  notes: z.string().trim(),
});

export type ProposalFormInput = z.infer<typeof proposalSchema>;
