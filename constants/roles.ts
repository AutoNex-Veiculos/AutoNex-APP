import type { Invitation, Role } from '@/types/auth';

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Proprietário',
  MANAGER: 'Gerente',
  SELLER: 'Vendedor',
  FINANCE: 'Financeiro',
  MARKETING: 'Marketing',
  AFTER_SALES: 'Pós-venda',
  PLATFORM_ADMIN: 'Administrador da plataforma',
};

export const INVITATION_STATUS_LABELS: Record<Invitation['status'], string> = {
  PENDING: 'Pendente',
  ACCEPTED: 'Aceito',
  CANCELED: 'Cancelado',
  EXPIRED: 'Expirado',
};
