import { assertCan, session, wait } from '@/services/mock/store';
import { allCompanies, countCompanyUsers } from '@/services/mock/auth.mock';
import { vehicleRecords } from '@/services/mock/vehicles.mock';
import type { AdminCompany, Plan, SubscriptionInfo, SubscriptionStatus } from '@/types/subscription';

const TRIAL_DAYS = 14;

// Limites de DEMONSTRAÇÃO: valores e condições comerciais serão definidos antes do lançamento.
export const PLANS: Plan[] = [
  { id: 'starter', name: 'Entrada', description: 'Para pequenas lojas e revendas.', limits: { users: 3, vehicles: 30, storageGb: 2 } },
  { id: 'pro', name: 'Intermediário', description: 'Para lojas com equipe e operação maior.', limits: { users: 10, vehicles: 150, storageGb: 10 } },
  { id: 'scale', name: 'Avançado', description: 'Para concessionárias com alto volume.', limits: { users: 30, vehicles: 600, storageGb: 50 } },
];

interface State {
  status: SubscriptionStatus;
  planId: string;
  trialEndsAt?: string;
}

const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

const states = new Map<string, State>([
  ['c1', { status: 'TRIAL', planId: 'starter', trialEndsAt: inDays(9) }],
  ['c2', { status: 'ACTIVE', planId: 'pro' }],
  ['c3', { status: 'PAST_DUE', planId: 'starter' }],
]);

function stateFor(companyId: string): State {
  let state = states.get(companyId);
  if (!state) {
    state = { status: 'TRIAL', planId: 'starter', trialEndsAt: inDays(TRIAL_DAYS) };
    states.set(companyId, state);
  }
  return state;
}

const planOf = (id: string) => PLANS.find((p) => p.id === id) ?? PLANS[0];

export async function getSubscription(): Promise<SubscriptionInfo> {
  await wait(250);
  const { user, companyId } = await session();
  assertCan(user.role, 'subscription', 'Você não tem permissão para ver a assinatura.');
  const state = stateFor(companyId);
  const plan = planOf(state.planId);
  const daysLeft = state.trialEndsAt ? Math.max(0, Math.ceil((new Date(state.trialEndsAt).getTime() - Date.now()) / 86_400_000)) : undefined;
  return {
    status: state.status,
    planId: plan.id,
    planName: plan.name,
    trialEndsAt: state.trialEndsAt,
    daysLeft,
    limits: plan.limits,
    usage: { users: countCompanyUsers(companyId), vehicles: vehicleRecords(companyId).length, storageGb: 0 },
    plans: PLANS,
  };
}

export async function listCompanies(): Promise<AdminCompany[]> {
  await wait();
  const { user } = await session();
  assertCan(user.role, 'platform', 'Você não tem permissão para ver as empresas.');
  return allCompanies().map((c) => {
    const state = stateFor(c.id);
    return {
      id: c.id,
      tradeName: c.tradeName,
      document: c.document,
      status: state.status,
      planName: planOf(state.planId).name,
      users: countCompanyUsers(c.id),
      vehicles: vehicleRecords(c.id).length,
    };
  });
}

export async function setCompanyStatus(companyId: string, status: 'SUSPENDED' | 'ACTIVE'): Promise<void> {
  await wait(200);
  const { user } = await session();
  assertCan(user.role, 'platform', 'Você não tem permissão para alterar empresas.');
  if (!allCompanies().some((c) => c.id === companyId)) throw new Error('Empresa não encontrada.');
  stateFor(companyId).status = status;
}
