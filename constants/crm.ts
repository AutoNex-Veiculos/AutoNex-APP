import type { LeadStage } from '@/types/crm';
import type { BadgeTone } from '@/types/ui';

export const STAGES: LeadStage[] = ['NEW', 'CONTACTED', 'VISIT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

export const STAGE_LABELS: Record<LeadStage, string> = {
  NEW: 'Novo',
  CONTACTED: 'Contato feito',
  VISIT: 'Visita agendada',
  PROPOSAL: 'Proposta',
  NEGOTIATION: 'Negociação',
  WON: 'Ganho',
  LOST: 'Perdido',
};

export const STAGE_TONES: Record<LeadStage, BadgeTone> = {
  NEW: 'neutral',
  CONTACTED: 'neutral',
  VISIT: 'warning',
  PROPOSAL: 'warning',
  NEGOTIATION: 'warning',
  WON: 'accent',
  LOST: 'dark',
};

export const LEAD_SOURCES = ['Indicação', 'Instagram', 'WhatsApp', 'Vitrine', 'Loja física', 'Portal de anúncios', 'Outro'];

// Ganho e perdido são finais; os demais podem ir para qualquer etapa.
export function stageTargets(stage: LeadStage): LeadStage[] {
  if (stage === 'WON' || stage === 'LOST') return [];
  return STAGES.filter((s) => s !== stage);
}
