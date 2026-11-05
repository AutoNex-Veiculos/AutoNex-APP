import { z } from 'zod';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const email = z.string().trim().min(1, 'Informe seu e-mail').email('E-mail inválido');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo'),
  email,
  password: z.string().min(8, 'A senha precisa ter ao menos 8 caracteres'),
  companyName: z.string().trim().min(2, 'Informe o nome da empresa'),
  // TODO: validar dígitos verificadores de CPF/CNPJ.
  document: z
    .string()
    .refine((v) => [11, 14].includes(onlyDigits(v).length), 'Informe um CNPJ ou CPF válido'),
  acceptTerms: z.boolean().refine((v) => v, 'Aceite os termos para continuar'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
