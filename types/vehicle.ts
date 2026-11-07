export type VehicleCategory = 'CAR' | 'MOTORCYCLE' | 'UTILITY' | 'PICKUP' | 'TRUCK';
export type VehicleStatus =
  | 'PREPARING'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'NEGOTIATING'
  | 'SOLD'
  | 'UNAVAILABLE'
  | 'ARCHIVED';
export type Fuel = 'GASOLINE' | 'ETHANOL' | 'FLEX' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
export type Transmission = 'MANUAL' | 'AUTOMATIC' | 'CVT' | 'AUTOMATED';

export interface Vehicle {
  id: string;
  category: VehicleCategory;
  brand: string;
  model: string;
  version?: string;
  yearManufacture: number;
  yearModel: number;
  color: string;
  mileage: number;
  fuel: Fuel;
  transmission: Transmission;
  plate?: string;
  description?: string;
  /** Preço anunciado, em reais. */
  price: number;
  /** Custos só chegam para quem tem permissão (a API deve omitir para os demais). */
  acquisitionCost?: number;
  extraCosts?: number;
  status: VehicleStatus;
  imageUrl?: string | null;
  createdAt: string;
}

export type VehiclePayload = Omit<Vehicle, 'id' | 'status' | 'imageUrl' | 'createdAt'>;
