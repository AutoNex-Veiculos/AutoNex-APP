// DADOS SIMULADOS: usados apenas com EXPO_PUBLIC_USE_MOCK=true.
// Ficam em memória e são perdidos ao recarregar o app.
import { can } from '@/utils/permissions';
import { currentUser } from '@/services/mock/auth.mock';
import { STATUS_TRANSITIONS } from '@/constants/vehicle';
import type { Vehicle, VehiclePayload, VehicleStatus } from '@/types/vehicle';
import type { Role } from '@/types/auth';

type DbVehicle = Vehicle & { companyId: string };

const wait = (ms = 350) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

const db: DbVehicle[] = [
  { id: 'v1', companyId: 'c1', category: 'CAR', brand: 'Toyota', model: 'Corolla', version: 'XEi 2.0 Flex', yearManufacture: 2020, yearModel: 2021, color: 'Prata', mileage: 48200, fuel: 'FLEX', transmission: 'CVT', plate: 'ABC1D23', price: 118900, acquisitionCost: 101000, extraCosts: 3200, status: 'AVAILABLE', createdAt: daysAgo(3) },
  { id: 'v2', companyId: 'c1', category: 'CAR', brand: 'Honda', model: 'Civic', version: 'Touring 1.5 Turbo', yearManufacture: 2019, yearModel: 2019, color: 'Preto', mileage: 61300, fuel: 'GASOLINE', transmission: 'CVT', plate: 'BRA2E19', price: 109900, acquisitionCost: 94500, extraCosts: 2100, status: 'RESERVED', createdAt: daysAgo(9) },
  { id: 'v3', companyId: 'c1', category: 'UTILITY', brand: 'Volkswagen', model: 'T-Cross', version: 'Highline 250 TSI', yearManufacture: 2022, yearModel: 2022, color: 'Branco', mileage: 29800, fuel: 'FLEX', transmission: 'AUTOMATIC', plate: 'QWE4R56', price: 124900, acquisitionCost: 108000, extraCosts: 4500, status: 'AVAILABLE', createdAt: daysAgo(5) },
  { id: 'v4', companyId: 'c1', category: 'PICKUP', brand: 'Fiat', model: 'Toro', version: 'Volcano 2.0 Diesel 4x4', yearManufacture: 2021, yearModel: 2021, color: 'Cinza', mileage: 54100, fuel: 'DIESEL', transmission: 'AUTOMATIC', plate: 'JKL7M89', price: 139900, acquisitionCost: 122000, extraCosts: 5800, status: 'NEGOTIATING', createdAt: daysAgo(14) },
  { id: 'v5', companyId: 'c1', category: 'MOTORCYCLE', brand: 'Honda', model: 'CG 160', version: 'Titan', yearManufacture: 2023, yearModel: 2023, color: 'Vermelha', mileage: 9800, fuel: 'FLEX', transmission: 'MANUAL', plate: 'MNO3P45', price: 15900, acquisitionCost: 13200, extraCosts: 400, status: 'AVAILABLE', createdAt: daysAgo(2) },
  { id: 'v6', companyId: 'c1', category: 'CAR', brand: 'Chevrolet', model: 'Onix', version: 'LT 1.0 Turbo', yearManufacture: 2020, yearModel: 2021, color: 'Azul', mileage: 42500, fuel: 'FLEX', transmission: 'AUTOMATIC', plate: 'STU8V01', price: 62900, acquisitionCost: 53000, extraCosts: 2800, status: 'PREPARING', createdAt: daysAgo(1) },
  { id: 'v7', companyId: 'c1', category: 'CAR', brand: 'Hyundai', model: 'HB20', version: 'Comfort 1.0', yearManufacture: 2018, yearModel: 2019, color: 'Vermelho', mileage: 77200, fuel: 'FLEX', transmission: 'MANUAL', plate: 'XYZ6A78', price: 51900, acquisitionCost: 44000, extraCosts: 1500, status: 'SOLD', createdAt: daysAgo(30) },
];

let sequence = 100;

// Simula a API: quem não pode ver custos não recebe esses campos.
function present(vehicle: DbVehicle, role: Role): Vehicle {
  const { companyId: _companyId, ...rest } = vehicle;
  if (can(role, 'vehicles:costs')) return rest;
  const { acquisitionCost: _a, extraCosts: _e, ...publicVehicle } = rest;
  return publicVehicle;
}

export async function listVehicles(): Promise<Vehicle[]> {
  await wait();
  const user = await currentUser();
  if (!can(user.role, 'vehicles')) throw new Error('Você não tem permissão para ver o estoque.');
  return db
    .filter((v) => v.companyId === user.companyId)
    .map((v) => present(v, user.role))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getVehicle(id: string): Promise<Vehicle> {
  await wait(250);
  const user = await currentUser();
  const vehicle = db.find((v) => v.id === id && v.companyId === user.companyId);
  if (!vehicle) throw new Error('Veículo não encontrado.');
  return present(vehicle, user.role);
}

export async function createVehicle(payload: VehiclePayload): Promise<Vehicle> {
  await wait();
  const user = await currentUser();
  if (!can(user.role, 'vehicles:write')) throw new Error('Você não tem permissão para cadastrar veículos.');
  const vehicle: DbVehicle = {
    ...payload,
    id: `v${++sequence}`,
    companyId: user.companyId ?? '',
    status: 'PREPARING',
    createdAt: new Date().toISOString(),
  };
  db.push(vehicle);
  return present(vehicle, user.role);
}

export async function updateVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
  await wait(250);
  const user = await currentUser();
  if (!can(user.role, 'vehicles:write')) throw new Error('Você não tem permissão para alterar o status.');
  const vehicle = db.find((v) => v.id === id && v.companyId === user.companyId);
  if (!vehicle) throw new Error('Veículo não encontrado.');
  if (!STATUS_TRANSITIONS[vehicle.status].includes(status)) {
    throw new Error('Esta mudança de status não é permitida.');
  }
  vehicle.status = status;
  return present(vehicle, user.role);
}

// ---- Uso interno dos outros mocks (vendas, vitrine, assinatura) ----
export function vehicleRecords(companyId: string): DbVehicle[] {
  return db.filter((v) => v.companyId === companyId);
}

export function vehicleRecord(companyId: string, id: string): DbVehicle | undefined {
  return db.find((v) => v.companyId === companyId && v.id === id);
}

export function vehicleLabel(companyId: string, id: string): string {
  const v = vehicleRecord(companyId, id);
  return v ? `${v.brand} ${v.model}${v.version ? ` ${v.version}` : ''} ${v.yearModel}` : 'Veículo removido';
}

export function forceVehicleStatus(companyId: string, id: string, status: VehicleStatus): void {
  const v = vehicleRecord(companyId, id);
  if (v) v.status = status;
}
