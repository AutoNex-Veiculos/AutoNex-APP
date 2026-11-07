import { api, USE_MOCK } from '@/services/api';
import * as mock from '@/services/mock/vehicles.mock';
import type { Vehicle, VehiclePayload, VehicleStatus } from '@/types/vehicle';

// Contrato assumido (ajustar com a API Java), veja api_endpoints.md:
//   GET   /vehicles               -> Vehicle[]
//   GET   /vehicles/{id}          -> Vehicle
//   POST  /vehicles               VehiclePayload -> Vehicle (nasce com status PREPARING)
//   PATCH /vehicles/{id}/status   { status }     -> Vehicle
export const vehicleService = {
  async list(): Promise<Vehicle[]> {
    if (USE_MOCK) return mock.listVehicles();
    const { data } = await api.get<Vehicle[]>('/vehicles');
    return data;
  },

  async get(id: string): Promise<Vehicle> {
    if (USE_MOCK) return mock.getVehicle(id);
    const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
    return data;
  },

  async create(payload: VehiclePayload): Promise<Vehicle> {
    if (USE_MOCK) return mock.createVehicle(payload);
    const { data } = await api.post<Vehicle>('/vehicles', payload);
    return data;
  },

  async updateStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
    if (USE_MOCK) return mock.updateVehicleStatus(id, status);
    const { data } = await api.patch<Vehicle>(`/vehicles/${id}/status`, { status });
    return data;
  },
};
