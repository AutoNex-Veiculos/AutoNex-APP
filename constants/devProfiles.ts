import type { Role } from '@/types/auth';
import type { IconName } from '@/types/ui';

// SOMENTE DESENVOLVIMENTO. Remova este arquivo e o <DevQuickLogin /> antes de publicar.
export const DEV_PASSWORD = 'AutoNex@123';

export interface DevProfile {
  role: Role;
  label: string;
  description: string;
  email: string;
  icon: IconName;
}

export const DEV_PROFILES: DevProfile[] = [
  { role: 'OWNER', label: 'Proprietário', description: 'Acesso total', email: 'demo@autonex.com', icon: 'key-outline' },
  { role: 'MANAGER', label: 'Gerente', description: 'Operação comercial', email: 'gerente@autonex.dev', icon: 'briefcase-outline' },
  { role: 'SELLER', label: 'Vendedor', description: 'Clientes e vendas', email: 'vendedor@autonex.dev', icon: 'pricetag-outline' },
  { role: 'FINANCE', label: 'Financeiro', description: 'Contas e caixa', email: 'financeiro@autonex.dev', icon: 'wallet-outline' },
  { role: 'MARKETING', label: 'Marketing', description: 'Vitrine e leads', email: 'marketing@autonex.dev', icon: 'megaphone-outline' },
  { role: 'AFTER_SALES', label: 'Pós-venda', description: 'Entregas e retorno', email: 'posvenda@autonex.dev', icon: 'construct-outline' },
  { role: 'PLATFORM_ADMIN', label: 'Admin da plataforma', description: 'Gestão do AutoNex', email: 'admin@autonex.dev', icon: 'shield-checkmark-outline' },
];
