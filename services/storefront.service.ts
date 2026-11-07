import { api, USE_MOCK } from '@/services/api';
import * as mock from '@/services/mock/storefront.mock';
import type { InterestPayload, Listing, PublicStore, StorefrontSettings } from '@/types/storefront';

// Contrato assumido, veja api_endpoints.md:
//   GET  /storefront/settings                  -> StorefrontSettings
//   PUT  /storefront/settings                  StorefrontSettings -> StorefrontSettings
//   GET  /storefront/listings                  -> Listing[]
//   PUT  /storefront/listings/{vehicleId}      { published } -> 204
//   GET  /public/stores/{slug}                 -> PublicStore            (sem login)
//   POST /public/stores/{slug}/interest        InterestPayload -> 204    (sem login, cria lead)
export const storefrontService = {
  async getSettings(): Promise<StorefrontSettings> {
    if (USE_MOCK) return mock.getSettings();
    return (await api.get<StorefrontSettings>('/storefront/settings')).data;
  },
  async saveSettings(payload: StorefrontSettings): Promise<StorefrontSettings> {
    if (USE_MOCK) return mock.saveSettings(payload);
    return (await api.put<StorefrontSettings>('/storefront/settings', payload)).data;
  },
  async listListings(): Promise<Listing[]> {
    if (USE_MOCK) return mock.listListings();
    return (await api.get<Listing[]>('/storefront/listings')).data;
  },
  async setPublished(vehicleId: string, published: boolean): Promise<void> {
    if (USE_MOCK) return mock.setPublished(vehicleId, published);
    await api.put(`/storefront/listings/${vehicleId}`, { published });
  },
  async getPublicStore(slug: string): Promise<PublicStore> {
    if (USE_MOCK) return mock.getPublicStore(slug);
    return (await api.get<PublicStore>(`/public/stores/${slug}`)).data;
  },
  async submitInterest(slug: string, payload: InterestPayload): Promise<void> {
    if (USE_MOCK) return mock.submitInterest(slug, payload);
    await api.post(`/public/stores/${slug}/interest`, payload);
  },
};
