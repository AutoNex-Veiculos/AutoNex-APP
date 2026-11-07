import type { Vehicle } from '@/types/vehicle';

export interface StorefrontSettings {
  storeName: string;
  slug: string;
  whatsapp?: string;
  about?: string;
  published: boolean;
}

export interface Listing {
  vehicle: Vehicle;
  published: boolean;
}

// Só campos que podem ser públicos: sem custos, placa ou dados internos.
export interface PublicVehicle {
  id: string;
  brand: string;
  model: string;
  version?: string;
  yearManufacture: number;
  yearModel: number;
  mileage: number;
  color: string;
  fuel: Vehicle['fuel'];
  transmission: Vehicle['transmission'];
  price: number;
  description?: string;
  imageUrl?: string | null;
}

export interface PublicStore {
  storeName: string;
  slug: string;
  whatsapp?: string;
  about?: string;
  vehicles: PublicVehicle[];
}

export interface InterestPayload {
  name: string;
  phone: string;
  message?: string;
  vehicleId?: string;
}
