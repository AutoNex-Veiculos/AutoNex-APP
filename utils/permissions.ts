import type { Role } from '@/types/auth';

export type Permission =
  | 'dashboard'
  | 'vehicles'
  | 'vehicles:write'
  | 'vehicles:costs'
  | 'customers'
  | 'sales'
  | 'sales:approve'
  | 'finance'
  | 'marketing'
  | 'aftersales'
  | 'reports'
  | 'team'
  | 'subscription'
  | 'platform';

const COMPANY_ALL: Permission[] = [
  'dashboard',
  'vehicles',
  'vehicles:write',
  'vehicles:costs',
  'customers',
  'sales',
  'sales:approve',
  'finance',
  'marketing',
  'aftersales',
  'reports',
  'team',
  'subscription',
];

// Controla apenas o que a interface exibe. A autorização real é feita pela API.
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: COMPANY_ALL,
  MANAGER: [
    'dashboard',
    'vehicles',
    'vehicles:write',
    'vehicles:costs',
    'customers',
    'sales',
    'sales:approve',
    'aftersales',
    'reports',
  ],
  SELLER: ['dashboard', 'vehicles', 'customers', 'sales'],
  FINANCE: ['dashboard', 'vehicles', 'vehicles:costs', 'finance', 'reports'],
  MARKETING: ['dashboard', 'vehicles', 'customers', 'marketing'],
  AFTER_SALES: ['dashboard', 'customers', 'aftersales'],
  PLATFORM_ADMIN: ['dashboard', 'platform'],
};

export function can(role: Role | undefined, permission: Permission): boolean {
  return !!role && ROLE_PERMISSIONS[role].includes(permission);
}
