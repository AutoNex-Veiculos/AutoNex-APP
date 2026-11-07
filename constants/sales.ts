import type { ProposalAction, ProposalStatus } from '@/types/sales';
import type { BadgeTone } from '@/types/ui';
import type { Permission } from '@/utils/permissions';

// Descontos acima deste limite exigem aprovação de gerente ou proprietário.
export const DISCOUNT_LIMIT_PERCENT = 5;
// Comissão padrão sobre o valor da venda (fica registrada em cada venda).
export const COMMISSION_RATE = 0.02;

export const PAYMENT_CONDITIONS = ['À vista', 'Financiamento', 'Consórcio contemplado', 'À vista com troca', 'Financiamento com troca'];

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  DRAFT: 'Rascunho',
  PENDING_APPROVAL: 'Aguardando aprovação',
  SENT: 'Enviada',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
  CONVERTED: 'Venda fechada',
  CANCELED: 'Cancelada',
};

export const PROPOSAL_STATUS_TONES: Record<ProposalStatus, BadgeTone> = {
  DRAFT: 'neutral',
  PENDING_APPROVAL: 'warning',
  SENT: 'warning',
  ACCEPTED: 'accent',
  REJECTED: 'neutral',
  CONVERTED: 'dark',
  CANCELED: 'neutral',
};

export const ACTION_LABELS: Record<ProposalAction, string> = {
  approve: 'Aprovar desconto',
  send: 'Marcar como enviada',
  accept: 'Cliente aceitou (reservar veículo)',
  reject: 'Cliente recusou',
  cancel: 'Cancelar proposta',
  close: 'Fechar venda',
};

export const ACTION_RESULT: Record<ProposalAction, ProposalStatus> = {
  approve: 'DRAFT',
  send: 'SENT',
  accept: 'ACCEPTED',
  reject: 'REJECTED',
  cancel: 'CANCELED',
  close: 'CONVERTED',
};

export const STATUS_ACTIONS: Record<ProposalStatus, ProposalAction[]> = {
  DRAFT: ['send', 'cancel'],
  PENDING_APPROVAL: ['approve', 'cancel'],
  SENT: ['accept', 'reject', 'cancel'],
  ACCEPTED: ['close', 'cancel'],
  REJECTED: [],
  CONVERTED: [],
  CANCELED: [],
};

export const ACTION_PERMISSION: Partial<Record<ProposalAction, Permission>> = {
  approve: 'sales:approve',
};
