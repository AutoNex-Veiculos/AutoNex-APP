import { api, USE_MOCK } from '@/services/api';
import * as mock from '@/services/mock/auth.mock';
import type { Session } from '@/types/auth';
import type { LoginInput, RegisterInput } from '@/utils/schemas/auth';

// Contrato assumido (ajustar com a API Java):
//   POST /auth/login     { email, password }        -> { token, user, company }
//   POST /auth/register  { name, email, password, companyName, document, acceptTerms } -> { token, user, company }
//   GET  /auth/me                                   -> { user, company }
export const authService = {
  async login(input: LoginInput): Promise<Session> {
    if (USE_MOCK) return mock.login(input);
    const { data } = await api.post<Session>('/auth/login', input);
    return data;
  },

  async registerCompany(input: RegisterInput): Promise<Session> {
    if (USE_MOCK) return mock.registerCompany(input);
    const { data } = await api.post<Session>('/auth/register', input);
    return data;
  },

  async me(): Promise<Pick<Session, 'user' | 'company'>> {
    if (USE_MOCK) return mock.me();
    const { data } = await api.get<Pick<Session, 'user' | 'company'>>('/auth/me');
    return data;
  },
};
