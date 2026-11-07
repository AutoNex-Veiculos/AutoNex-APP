import { api, USE_MOCK } from '@/services/api';
import * as mock from '@/services/mock/auth.mock';
import type { Invitation } from '@/types/auth';
import type { InviteInput } from '@/utils/schemas/team';

// Contrato assumido (ajustar com a API Java):
//   GET    /invitations        -> Invitation[]
//   POST   /invitations        { email, role } -> Invitation
//   DELETE /invitations/{id}   -> 204
export const teamService = {
  async listInvitations(): Promise<Invitation[]> {
    if (USE_MOCK) return mock.listInvitations();
    const { data } = await api.get<Invitation[]>('/invitations');
    return data;
  },

  async createInvitation(input: InviteInput): Promise<Invitation> {
    if (USE_MOCK) return mock.createInvitation(input);
    const { data } = await api.post<Invitation>('/invitations', input);
    return data;
  },

  async cancelInvitation(id: string): Promise<void> {
    if (USE_MOCK) return mock.cancelInvitation(id);
    await api.delete(`/invitations/${id}`);
  },
};
