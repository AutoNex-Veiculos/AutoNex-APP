export type Role =
  | 'OWNER'
  | 'MANAGER'
  | 'SELLER'
  | 'FINANCE'
  | 'MARKETING'
  | 'AFTER_SALES'
  | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string | null;
}

export interface Company {
  id: string;
  tradeName: string;
  document: string;
}

export interface Session {
  token: string;
  user: User;
  company: Company | null;
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'EXPIRED';
  expiresAt: string;
}
