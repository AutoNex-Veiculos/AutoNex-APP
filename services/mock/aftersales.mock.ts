import { assertCan, dateOffset, daysAgo, session, uid, wait } from '@/services/mock/store';
import { CASE_STATUSES, DELIVERY_CHECKLIST } from '@/constants/aftersales';
import type { AfterSalesCase, CasePayload, CaseStatus } from '@/types/aftersales';
import type { Sale } from '@/types/sales';

type DbCase = AfterSalesCase & { companyId: string };

const checklist = (doneCount: number) =>
  DELIVERY_CHECKLIST.map((label, i) => ({ id: `ck${i}`, label, done: i < doneCount }));

const cases: DbCase[] = [
  { id: 'ac1', companyId: 'c1', type: 'DELIVERY', title: 'Entrega do HB20 Comfort', customerName: 'Aline Barros', vehicleLabel: 'Hyundai HB20 Comfort 1.0 2019', saleId: 's1', status: 'DONE', dueDate: dateOffset(-8), checklist: checklist(5), createdAt: daysAgo(10) },
  { id: 'ac2', companyId: 'c1', type: 'FOLLOW_UP', title: 'Ligar para saber como está o carro', customerName: 'Aline Barros', vehicleLabel: 'Hyundai HB20 Comfort 1.0 2019', saleId: 's1', status: 'OPEN', dueDate: dateOffset(3), checklist: [], createdAt: daysAgo(8) },
  { id: 'ac3', companyId: 'c1', type: 'COMPLAINT', title: 'Ruído na suspensão dianteira', description: 'Cliente relatou barulho ao passar em lombadas.', customerName: 'Paulo Henrique Ramos', vehicleLabel: 'Chevrolet Onix LT 1.0 Turbo 2021', status: 'IN_PROGRESS', dueDate: dateOffset(1), checklist: [], createdAt: daysAgo(2) },
];

const strip = ({ companyId: _c, ...rest }: DbCase): AfterSalesCase => rest;

// Chamado pelo fechamento de venda: abre o caso de entrega com o checklist padrão.
export function createDeliveryCase(companyId: string, sale: Sale): void {
  if (cases.some((c) => c.companyId === companyId && c.saleId === sale.id && c.type === 'DELIVERY')) return;
  cases.push({
    id: uid('ac'),
    companyId,
    type: 'DELIVERY',
    title: `Entrega: ${sale.vehicleLabel}`,
    customerName: sale.customerName,
    vehicleLabel: sale.vehicleLabel,
    saleId: sale.id,
    status: 'OPEN',
    dueDate: new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10),
    checklist: checklist(0),
    createdAt: new Date().toISOString(),
  });
}

export async function listCases(): Promise<AfterSalesCase[]> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'aftersales', 'Você não tem permissão para ver o pós-venda.');
  return cases.filter((c) => c.companyId === companyId).map(strip).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export async function getCase(id: string): Promise<AfterSalesCase> {
  await wait(200);
  const { user, companyId } = await session();
  assertCan(user.role, 'aftersales', 'Você não tem permissão para ver o pós-venda.');
  const found = cases.find((c) => c.id === id && c.companyId === companyId);
  if (!found) throw new Error('Atendimento não encontrado.');
  return strip(found);
}

export async function createCase(payload: CasePayload): Promise<AfterSalesCase> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'aftersales', 'Você não tem permissão para abrir atendimentos.');
  const created: DbCase = {
    ...payload,
    id: uid('ac'),
    companyId,
    status: 'OPEN',
    checklist: payload.type === 'DELIVERY' ? checklist(0) : [],
    createdAt: new Date().toISOString(),
  };
  cases.push(created);
  return strip(created);
}

export async function updateCaseStatus(id: string, status: CaseStatus): Promise<AfterSalesCase> {
  await wait(200);
  const { user, companyId } = await session();
  assertCan(user.role, 'aftersales', 'Você não tem permissão para alterar atendimentos.');
  const found = cases.find((c) => c.id === id && c.companyId === companyId);
  if (!found) throw new Error('Atendimento não encontrado.');
  if (!CASE_STATUSES.includes(status)) throw new Error('Status inválido.');
  if (status === 'DONE' && found.checklist.some((item) => !item.done)) {
    throw new Error('Conclua todos os itens do checklist antes de finalizar.');
  }
  found.status = status;
  return strip(found);
}

export async function toggleChecklistItem(id: string, itemId: string): Promise<AfterSalesCase> {
  await wait(150);
  const { user, companyId } = await session();
  assertCan(user.role, 'aftersales', 'Você não tem permissão para alterar atendimentos.');
  const found = cases.find((c) => c.id === id && c.companyId === companyId);
  if (!found) throw new Error('Atendimento não encontrado.');
  const item = found.checklist.find((i) => i.id === itemId);
  if (!item) throw new Error('Item não encontrado.');
  if (found.status === 'DONE') throw new Error('Atendimento já concluído.');
  item.done = !item.done;
  return strip(found);
}
