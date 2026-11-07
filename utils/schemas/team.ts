import { z } from 'zod';

export const INVITABLE_ROLES = ['MANAGER', 'SELLER', 'FINANCE', 'MARKETING', 'AFTER_SALES'] as const;

export const inviteSchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail do funcionário').email('E-mail inválido'),
  role: z.enum(INVITABLE_ROLES),
});

export type InviteInput = z.infer<typeof inviteSchema>;
