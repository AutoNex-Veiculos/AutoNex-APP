import { api, USE_MOCK } from '@/services/api';
import * as mock from '@/services/mock/subscription.mock';
import type { AdminCompany, SubscriptionInfo } from '@/types/subscription';

// Contrato assumido, veja api_endpoints.md:
//   GET  /subscription                         -> SubscriptionInfo
//   GET  /admin/companies                      -> AdminCompany[]   (só administrador da plataforma)
//   POST /admin/companies/{id}/suspend         -> 204
//   POST /admin/companies/{id}/reactivate      -> 204
export const subscriptionService = {
  async get(): Promise<SubscriptionInfo> {
    if (USE_MOCK) return mock.getSubscription();
    return (await api.get<SubscriptionInfo>('/subscription')).data;
  },
  async listCompanies(): Promise<AdminCompany[]> {
    if (USE_MOCK) return mock.listCompanies();
    return (await api.get<AdminCompany[]>('/admin/companies')).data;
  },
  async setCompanyStatus(id: string, status: 'SUSPENDED' | 'ACTIVE'): Promise<void> {
    if (USE_MOCK) return mock.setCompanyStatus(id, status);
    await api.post(`/admin/companies/${id}/${status === 'SUSPENDED' ? 'suspend' : 'reactivate'}`);
  },
};
