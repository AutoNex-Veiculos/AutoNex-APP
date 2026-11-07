import { api, USE_MOCK } from '@/services/api';
import * as mock from '@/services/mock/crm.mock';
import type { Customer, Lead, LeadPayload, LeadStage } from '@/types/crm';

// Contrato assumido, veja api_endpoints.md:
//   GET   /leads                  -> Lead[]
//   GET   /leads/{id}             -> Lead
//   POST  /leads                  LeadPayload -> Lead (cria ou reaproveita o cliente pelo telefone)
//   PATCH /leads/{id}/stage       { stage }   -> Lead
//   POST  /leads/{id}/notes       { text }    -> Lead
//   GET   /customers              -> Customer[]
export const crmService = {
  async listLeads(): Promise<Lead[]> {
    if (USE_MOCK) return mock.listLeads();
    return (await api.get<Lead[]>('/leads')).data;
  },
  async getLead(id: string): Promise<Lead> {
    if (USE_MOCK) return mock.getLead(id);
    return (await api.get<Lead>(`/leads/${id}`)).data;
  },
  async createLead(payload: LeadPayload): Promise<Lead> {
    if (USE_MOCK) return mock.createLead(payload);
    return (await api.post<Lead>('/leads', payload)).data;
  },
  async updateStage(id: string, stage: LeadStage): Promise<Lead> {
    if (USE_MOCK) return mock.updateLeadStage(id, stage);
    return (await api.patch<Lead>(`/leads/${id}/stage`, { stage })).data;
  },
  async addNote(id: string, text: string): Promise<Lead> {
    if (USE_MOCK) return mock.addLeadNote(id, text);
    return (await api.post<Lead>(`/leads/${id}/notes`, { text })).data;
  },
  async listCustomers(): Promise<Customer[]> {
    if (USE_MOCK) return mock.listCustomers();
    return (await api.get<Customer[]>('/customers')).data;
  },
};
