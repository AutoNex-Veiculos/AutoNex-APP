import { api, USE_MOCK } from '@/services/api';
import * as mock from '@/services/mock/aftersales.mock';
import type { AfterSalesCase, CasePayload, CaseStatus } from '@/types/aftersales';

// Contrato assumido, veja api_endpoints.md:
//   GET   /aftersales/cases                              -> AfterSalesCase[]
//   GET   /aftersales/cases/{id}                         -> AfterSalesCase
//   POST  /aftersales/cases                              CasePayload -> AfterSalesCase
//   PATCH /aftersales/cases/{id}/status                  { status } -> AfterSalesCase
//   POST  /aftersales/cases/{id}/checklist/{itemId}/toggle -> AfterSalesCase
export const aftersalesService = {
  async list(): Promise<AfterSalesCase[]> {
    if (USE_MOCK) return mock.listCases();
    return (await api.get<AfterSalesCase[]>('/aftersales/cases')).data;
  },
  async get(id: string): Promise<AfterSalesCase> {
    if (USE_MOCK) return mock.getCase(id);
    return (await api.get<AfterSalesCase>(`/aftersales/cases/${id}`)).data;
  },
  async create(payload: CasePayload): Promise<AfterSalesCase> {
    if (USE_MOCK) return mock.createCase(payload);
    return (await api.post<AfterSalesCase>('/aftersales/cases', payload)).data;
  },
  async updateStatus(id: string, status: CaseStatus): Promise<AfterSalesCase> {
    if (USE_MOCK) return mock.updateCaseStatus(id, status);
    return (await api.patch<AfterSalesCase>(`/aftersales/cases/${id}/status`, { status })).data;
  },
  async toggleItem(id: string, itemId: string): Promise<AfterSalesCase> {
    if (USE_MOCK) return mock.toggleChecklistItem(id, itemId);
    return (await api.post<AfterSalesCase>(`/aftersales/cases/${id}/checklist/${itemId}/toggle`)).data;
  },
};
