import type {
  Fuel,
  Transmission,
  VehicleCategory,
  VehicleStatus,
} from '@/types/vehicle';
import type { BadgeTone } from '@/types/ui';

export const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  CAR: 'Carro',
  MOTORCYCLE: 'Moto',
  UTILITY: 'Utilitário',
  PICKUP: 'Caminhonete',
  TRUCK: 'Caminhão',
};

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  PREPARING: 'Em preparação',
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservado',
  NEGOTIATING: 'Em negociação',
  SOLD: 'Vendido',
  UNAVAILABLE: 'Indisponível',
  ARCHIVED: 'Arquivado',
};

export const STATUS_TONES: Record<VehicleStatus, BadgeTone> = {
  PREPARING: 'neutral',
  AVAILABLE: 'accent',
  RESERVED: 'warning',
  NEGOTIATING: 'warning',
  SOLD: 'dark',
  UNAVAILABLE: 'neutral',
  ARCHIVED: 'neutral',
};

export const FUEL_LABELS: Record<Fuel, string> = {
  GASOLINE: 'Gasolina',
  ETHANOL: 'Etanol',
  FLEX: 'Flex',
  DIESEL: 'Diesel',
  ELECTRIC: 'Elétrico',
  HYBRID: 'Híbrido',
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
  CVT: 'CVT',
  AUTOMATED: 'Automatizado',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as VehicleCategory[];
export const FUELS = Object.keys(FUEL_LABELS) as Fuel[];
export const TRANSMISSIONS = Object.keys(TRANSMISSION_LABELS) as Transmission[];
export const STATUSES = Object.keys(STATUS_LABELS) as VehicleStatus[];

// Transições permitidas entre status (um veículo vendido não volta a ficar disponível).
export const STATUS_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  PREPARING: ['AVAILABLE', 'UNAVAILABLE', 'ARCHIVED'],
  AVAILABLE: ['RESERVED', 'NEGOTIATING', 'PREPARING', 'UNAVAILABLE', 'ARCHIVED'],
  RESERVED: ['AVAILABLE', 'NEGOTIATING', 'SOLD'],
  NEGOTIATING: ['AVAILABLE', 'RESERVED', 'SOLD'],
  SOLD: ['ARCHIVED'],
  UNAVAILABLE: ['AVAILABLE', 'PREPARING', 'ARCHIVED'],
  ARCHIVED: ['UNAVAILABLE'],
};

// Fórmula do "valor do estoque": soma dos preços anunciados destes status.
export const STOCK_VALUE_STATUSES: VehicleStatus[] = ['PREPARING', 'AVAILABLE', 'RESERVED', 'NEGOTIATING'];
