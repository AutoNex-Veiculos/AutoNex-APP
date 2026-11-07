import type { Vehicle, VehiclePayload } from '@/types/vehicle';
import type { VehicleFormInput } from '@/utils/schemas/vehicle';
import { parseNumber } from '@/utils/format';

export function toVehiclePayload(v: VehicleFormInput): VehiclePayload {
  const optional = (s: string | undefined) => (s && s.trim() ? s.trim() : undefined);
  const optionalNumber = (s: string) => (s.trim() ? (parseNumber(s) ?? undefined) : undefined);
  return {
    category: v.category as VehiclePayload['category'],
    brand: v.brand,
    model: v.model,
    version: optional(v.version),
    plate: optional(v.plate)?.toUpperCase().replace('-', ''),
    yearManufacture: Number(v.yearManufacture),
    yearModel: Number(v.yearModel),
    mileage: parseNumber(v.mileage) ?? 0,
    color: v.color,
    fuel: v.fuel as VehiclePayload['fuel'],
    transmission: v.transmission as VehiclePayload['transmission'],
    price: parseNumber(v.price) ?? 0,
    acquisitionCost: optionalNumber(v.acquisitionCost),
    extraCosts: optionalNumber(v.extraCosts),
    description: optional(v.description),
  };
}

export interface VehicleResult {
  totalCost: number;
  result: number;
  /** "estimado" até a venda; "realizado" quando o veículo está vendido. */
  kind: 'estimated' | 'realized';
}

// Resultado = preço anunciado - (custo de aquisição + custos adicionais).
export function vehicleResult(v: Vehicle): VehicleResult | null {
  if (v.acquisitionCost === undefined) return null;
  const totalCost = v.acquisitionCost + (v.extraCosts ?? 0);
  return { totalCost, result: v.price - totalCost, kind: v.status === 'SOLD' ? 'realized' : 'estimated' };
}
