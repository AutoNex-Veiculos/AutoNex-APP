import { z } from 'zod';
import { CATEGORIES, FUELS, TRANSMISSIONS } from '@/constants/vehicle';
import { parseNumber } from '@/utils/format';

const currentYear = new Date().getFullYear();
const year = z
  .string()
  .refine((v) => /^\d{4}$/.test(v) && Number(v) >= 1950 && Number(v) <= currentYear + 1, 'Informe um ano válido');
const money = z.string().refine((v) => parseNumber(v) !== null, 'Informe um valor válido');
const optionalMoney = z.string().refine((v) => v.trim() === '' || parseNumber(v) !== null, 'Informe um valor válido');

export const vehicleSchema = z
  .object({
    category: z.enum(CATEGORIES as [string, ...string[]]),
    brand: z.string().trim().min(2, 'Informe a marca'),
    model: z.string().trim().min(1, 'Informe o modelo'),
    version: z.string().trim().optional(),
    plate: z
      .string()
      .trim()
      .refine((v) => v === '' || /^[A-Za-z]{3}-?\d[A-Za-z0-9]\d{2}$/.test(v), 'Placa inválida'),
    yearManufacture: year,
    yearModel: year,
    mileage: z.string().refine((v) => parseNumber(v) !== null, 'Informe a quilometragem'),
    color: z.string().trim().min(2, 'Informe a cor'),
    fuel: z.enum(FUELS as [string, ...string[]]),
    transmission: z.enum(TRANSMISSIONS as [string, ...string[]]),
    price: money.refine((v) => (parseNumber(v) ?? 0) > 0, 'O preço deve ser maior que zero'),
    acquisitionCost: optionalMoney,
    extraCosts: optionalMoney,
    description: z.string().trim().optional(),
  })
  .superRefine((v, ctx) => {
    const made = Number(v.yearManufacture);
    const model = Number(v.yearModel);
    if (/^\d{4}$/.test(v.yearManufacture) && /^\d{4}$/.test(v.yearModel) && (model < made || model > made + 1)) {
      ctx.addIssue({ code: 'custom', path: ['yearModel'], message: 'O ano do modelo é o de fabricação ou o seguinte' });
    }
  });

export type VehicleFormInput = z.infer<typeof vehicleSchema>;
