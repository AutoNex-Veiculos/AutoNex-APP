import type { CaseStatus, CaseType } from '@/types/aftersales';
import type { BadgeTone } from '@/types/ui';

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  DELIVERY: 'Entrega',
  FOLLOW_UP: 'Acompanhamento',
  COMPLAINT: 'Reclamação',
  REQUEST: 'Solicitação',
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluído',
};

export const CASE_STATUS_TONES: Record<CaseStatus, BadgeTone> = {
  OPEN: 'warning',
  IN_PROGRESS: 'warning',
  DONE: 'accent',
};

export const CASE_STATUSES = Object.keys(CASE_STATUS_LABELS) as CaseStatus[];
export const CASE_TYPES = Object.keys(CASE_TYPE_LABELS) as CaseType[];

export const DELIVERY_CHECKLIST = [
  'Documentação do veículo conferida',
  'Veículo lavado e vistoriado',
  'Chaves e manual entregues',
  'Termo de entrega assinado',
  'Cliente orientado sobre garantia e revisões',
];
