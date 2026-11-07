// Utilitários compartilhados pelos mocks. DADOS SIMULADOS (somente com EXPO_PUBLIC_USE_MOCK=true).
import { currentUser } from '@/services/mock/auth.mock';
import { can, type Permission } from '@/utils/permissions';
import type { Role } from '@/types/auth';

export const wait = (ms = 300) => new Promise<void>((resolve) => setTimeout(resolve, ms));
export const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
export const dateOffset = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
export const today = () => new Date().toISOString().slice(0, 10);
export const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export async function session() {
  const user = await currentUser();
  return { user, companyId: user.companyId ?? '' };
}

export function assertCan(role: Role, permission: Permission, message: string): void {
  if (!can(role, permission)) throw new Error(message);
}
