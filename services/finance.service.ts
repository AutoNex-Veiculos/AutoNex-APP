import { api, USE_MOCK } from '@/services/api';
import * as mock from '@/services/mock/finance.mock';
import type { EntryPayload, FinancialEntry } from '@/types/finance';

// Contrato assumido, veja api_endpoints.md:
//   GET   /finance/entries              -> FinancialEntry[]
//   POST  /finance/entries              EntryPayload -> FinancialEntry
//   POST  /finance/entries/{id}/pay     -> FinancialEntry
//   POST  /finance/entries/{id}/cancel  -> FinancialEntry
export const financeService = {
  async list(): Promise<FinancialEntry[]> {
    if (USE_MOCK) return mock.listEntries();
    return (await api.get<FinancialEntry[]>('/finance/entries')).data;
  },
  async create(payload: EntryPayload): Promise<FinancialEntry> {
    if (USE_MOCK) return mock.createEntry(payload);
    return (await api.post<FinancialEntry>('/finance/entries', payload)).data;
  },
  async markPaid(id: string): Promise<FinancialEntry> {
    if (USE_MOCK) return mock.markEntryPaid(id);
    return (await api.post<FinancialEntry>(`/finance/entries/${id}/pay`)).data;
  },
  async cancel(id: string): Promise<FinancialEntry> {
    if (USE_MOCK) return mock.cancelEntry(id);
    return (await api.post<FinancialEntry>(`/finance/entries/${id}/cancel`)).data;
  },
};
