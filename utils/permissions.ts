import type { Role } from '@/types/auth';
import { useAuthStore } from '@/features/auth/auth-store';

export type Permission =
  | 'dashboard'
  | 'vehicles'
  | 'customers'
  | 'sales'
  | 'finance'
  | 'marketing'
  | 'aftersales'
  | 'team'
  | 'subscription';

const ALL: Permission[] = [
  'dashboard',
  'vehicles',
  'customers',
  'sales',
  'finance',
  'marketing',
  'aftersales',
  'team',
  'subscription',
];

// Controla apenas o que a interface exibe. A autorização real é feita pela API.
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: ALL,
  MANAGER: ['dashboard', 'vehicles', 'customers', 'sales', 'aftersales'],
  SELLER: ['dashboard', 'vehicles', 'customers', 'sales'],
  FINANCE: ['dashboard', 'finance'],
  MARKETING: ['dashboard', 'vehicles', 'customers', 'marketing'],
  AFTER_SALES: ['dashboard', 'customers', 'aftersales'],
  PLATFORM_ADMIN: ['dashboard'],
};

export function can(role: Role | undefined, permission: Permission): boolean {
  return !!role && ROLE_PERMISSIONS[role].includes(permission);
}

export function useCan(permission: Permission): boolean {
  return useAuthStore((s) => can(s.session?.user.role, permission));
}
