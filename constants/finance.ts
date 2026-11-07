import type { EntryStatus, EntryType } from '@/types/finance';
import type { BadgeTone } from '@/types/ui';

export const TYPE_LABELS: Record<EntryType, string> = { RECEIVABLE: 'A receber', PAYABLE: 'A pagar' };

export const STATUS_LABELS: Record<EntryStatus, string> = { PENDING: 'Pendente', PAID: 'Pago', CANCELED: 'Cancelado' };

export const STATUS_TONES: Record<EntryStatus, BadgeTone> = { PENDING: 'warning', PAID: 'accent', CANCELED: 'neutral' };

export const CATEGORIES: Record<EntryType, string[]> = {
  RECEIVABLE: ['Venda de veículo', 'Comissão recebida', 'Outras receitas'],
  PAYABLE: [
    'Aquisição de veículo',
    'Preparação e reparos',
    'Documentação',
    'Comissões',
    'Marketing',
    'Despesas fixas',
    'Impostos e taxas',
    'Outras despesas',
  ],
};
