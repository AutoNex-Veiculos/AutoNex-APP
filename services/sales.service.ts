import { api, USE_MOCK } from '@/services/api';
import * as mock from '@/services/mock/sales.mock';
import type { Proposal, ProposalAction, ProposalPayload, Sale } from '@/types/sales';

// Contrato assumido, veja api_endpoints.md:
//   GET  /proposals                       -> Proposal[]
//   GET  /proposals/{id}                  -> Proposal
//   POST /proposals                       ProposalPayload -> Proposal
//   POST /proposals/{id}/actions/{action} -> Proposal   (approve, send, accept, reject, cancel, close)
//   GET  /sales                           -> Sale[]
export const salesService = {
  async listProposals(): Promise<Proposal[]> {
    if (USE_MOCK) return mock.listProposals();
    return (await api.get<Proposal[]>('/proposals')).data;
  },
  async getProposal(id: string): Promise<Proposal> {
    if (USE_MOCK) return mock.getProposal(id);
    return (await api.get<Proposal>(`/proposals/${id}`)).data;
  },
  async createProposal(payload: ProposalPayload): Promise<Proposal> {
    if (USE_MOCK) return mock.createProposal(payload);
    return (await api.post<Proposal>('/proposals', payload)).data;
  },
  async runAction(id: string, action: ProposalAction): Promise<Proposal> {
    if (USE_MOCK) return mock.runProposalAction(id, action);
    return (await api.post<Proposal>(`/proposals/${id}/actions/${action}`)).data;
  },
  async listSales(): Promise<Sale[]> {
    if (USE_MOCK) return mock.listSales();
    return (await api.get<Sale[]>('/sales')).data;
  },
};
