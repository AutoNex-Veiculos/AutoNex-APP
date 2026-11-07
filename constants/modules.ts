import type { Permission } from '@/utils/permissions';
import type { IconName } from '@/types/ui';

export type AppRoute =
  | '/vehicles'
  | '/crm'
  | '/sales'
  | '/finance'
  | '/aftersales'
  | '/storefront'
  | '/reports'
  | '/team'
  | '/subscription'
  | '/admin';

export interface AppModule {
  key: Permission;
  title: string;
  description: string;
  icon: IconName;
  route: AppRoute;
}

// A ordem daqui é a ordem do menu e dos cartões do início.
export const MODULES: AppModule[] = [
  { key: 'vehicles', title: 'Estoque', description: 'Cadastro, custos e status dos veículos.', icon: 'car-sport-outline', route: '/vehicles' },
  { key: 'customers', title: 'Clientes e leads', description: 'Contatos, funil de vendas e anotações.', icon: 'person-circle-outline', route: '/crm' },
  { key: 'sales', title: 'Vendas', description: 'Propostas, aprovação de descontos e fechamento.', icon: 'pricetag-outline', route: '/sales' },
  { key: 'finance', title: 'Financeiro', description: 'Contas a pagar e receber e fluxo de caixa.', icon: 'wallet-outline', route: '/finance' },
  { key: 'aftersales', title: 'Pós-venda', description: 'Entregas, atendimentos e lembretes.', icon: 'construct-outline', route: '/aftersales' },
  { key: 'marketing', title: 'Vitrine', description: 'Publicação dos veículos para o público.', icon: 'megaphone-outline', route: '/storefront' },
  { key: 'reports', title: 'Relatórios', description: 'Vendas, estoque parado e resultado financeiro.', icon: 'bar-chart-outline', route: '/reports' },
  { key: 'team', title: 'Equipe', description: 'Convites, funções e permissões.', icon: 'people-outline', route: '/team' },
  { key: 'subscription', title: 'Assinatura', description: 'Plano, teste gratuito e limites de uso.', icon: 'card-outline', route: '/subscription' },
  { key: 'platform', title: 'Plataforma', description: 'Empresas clientes e assinaturas do AutoNex.', icon: 'business-outline', route: '/admin' },
];
