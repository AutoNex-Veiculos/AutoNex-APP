import type { Permission } from '@/features/auth/permissions';

export interface AppModule {
  key: Permission;
  title: string;
  description: string;
  route?: '/team';
}

// Módulos sem `route` ainda não têm tela: entram nas próximas fases.
export const MODULES: AppModule[] = [
  { key: 'vehicles', title: 'Estoque', description: 'Cadastro, fotos, custos e status dos veículos.' },
  { key: 'customers', title: 'Clientes e leads', description: 'Contatos, funil de vendas e tarefas.' },
  { key: 'sales', title: 'Vendas', description: 'Propostas, reservas e fechamento.' },
  { key: 'finance', title: 'Financeiro', description: 'Contas a pagar e receber e fluxo de caixa.' },
  { key: 'marketing', title: 'Vitrine', description: 'Publicação dos veículos para o público.' },
  { key: 'aftersales', title: 'Pós-venda', description: 'Entregas, atendimentos e lembretes.' },
  { key: 'team', title: 'Equipe', description: 'Convites, funções e permissões.', route: '/team' },
  { key: 'subscription', title: 'Assinatura', description: 'Plano, teste gratuito e cobrança.' },
];
