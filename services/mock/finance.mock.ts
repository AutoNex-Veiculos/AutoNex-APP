import { assertCan, dateOffset, daysAgo, session, uid, wait } from '@/services/mock/store';
import { vehicleLabel, vehicleRecord } from '@/services/mock/vehicles.mock';
import type { EntryPayload, FinancialEntry } from '@/types/finance';
import type { Sale } from '@/types/sales';

type DbEntry = FinancialEntry & { companyId: string };

const entries: DbEntry[] = [
  { id: 'f1', companyId: 'c1', type: 'RECEIVABLE', description: 'Venda HB20 Comfort 2019', category: 'Venda de veículo', amount: 50900, dueDate: dateOffset(-10), paidAt: daysAgo(9), status: 'PAID', vehicleId: 'v7', saleId: 's1', createdAt: daysAgo(12) },
  { id: 'f2', companyId: 'c1', type: 'PAYABLE', description: 'Aquisição Chevrolet Onix LT', category: 'Aquisição de veículo', amount: 53000, dueDate: dateOffset(-20), paidAt: daysAgo(20), status: 'PAID', vehicleId: 'v6', createdAt: daysAgo(22) },
  { id: 'f3', companyId: 'c1', type: 'PAYABLE', description: 'Funilaria do Onix', category: 'Preparação e reparos', amount: 2800, dueDate: dateOffset(5), status: 'PENDING', vehicleId: 'v6', createdAt: daysAgo(3) },
  { id: 'f4', companyId: 'c1', type: 'PAYABLE', description: 'Aluguel do pátio', category: 'Despesas fixas', amount: 6500, dueDate: dateOffset(8), status: 'PENDING', createdAt: daysAgo(5) },
  { id: 'f5', companyId: 'c1', type: 'PAYABLE', description: 'Anúncios em portais', category: 'Marketing', amount: 1800, dueDate: dateOffset(-3), status: 'PENDING', createdAt: daysAgo(10) },
  { id: 'f6', companyId: 'c1', type: 'RECEIVABLE', description: 'Entrada do Civic Touring', category: 'Venda de veículo', amount: 20000, dueDate: dateOffset(4), status: 'PENDING', vehicleId: 'v2', createdAt: daysAgo(6) },
  { id: 'f7', companyId: 'c1', type: 'PAYABLE', description: 'Comissão da venda do HB20', category: 'Comissões', amount: 1018, dueDate: dateOffset(12), status: 'PENDING', createdAt: daysAgo(9) },
  { id: 'f8', companyId: 'c1', type: 'PAYABLE', description: 'Aquisição Toyota Corolla XEi', category: 'Aquisição de veículo', amount: 101000, dueDate: dateOffset(-45), paidAt: daysAgo(45), status: 'PAID', vehicleId: 'v1', createdAt: daysAgo(47) },
];

function present(entry: DbEntry): FinancialEntry {
  const { companyId, ...rest } = entry;
  return { ...rest, vehicleLabel: entry.vehicleId ? vehicleLabel(companyId, entry.vehicleId) : undefined };
}

// Chamado pelo fechamento de venda. Idempotente: não cria dois lançamentos para a mesma venda.
export function createReceivableForSale(companyId: string, sale: Sale): void {
  if (entries.some((e) => e.companyId === companyId && e.saleId === sale.id)) return;
  entries.push({
    id: uid('f'),
    companyId,
    type: 'RECEIVABLE',
    description: `Venda ${sale.vehicleLabel}`,
    category: 'Venda de veículo',
    amount: sale.saleValue,
    dueDate: new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10),
    status: 'PENDING',
    vehicleId: sale.vehicleId,
    saleId: sale.id,
    createdAt: new Date().toISOString(),
  });
}

export async function listEntries(): Promise<FinancialEntry[]> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'finance', 'Você não tem permissão para ver o financeiro.');
  return entries.filter((e) => e.companyId === companyId).map(present).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export async function createEntry(payload: EntryPayload): Promise<FinancialEntry> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'finance', 'Você não tem permissão para lançar no financeiro.');
  if (payload.vehicleId && !vehicleRecord(companyId, payload.vehicleId)) throw new Error('Veículo não encontrado.');
  const entry: DbEntry = { ...payload, id: uid('f'), companyId, status: 'PENDING', createdAt: new Date().toISOString() };
  entries.push(entry);
  return present(entry);
}

export async function markEntryPaid(id: string): Promise<FinancialEntry> {
  await wait(200);
  const { user, companyId } = await session();
  assertCan(user.role, 'finance', 'Você não tem permissão para baixar lançamentos.');
  const entry = entries.find((e) => e.id === id && e.companyId === companyId);
  if (!entry) throw new Error('Lançamento não encontrado.');
  if (entry.status !== 'PENDING') throw new Error('Só lançamentos pendentes podem ser baixados.');
  entry.status = 'PAID';
  entry.paidAt = new Date().toISOString();
  return present(entry);
}

// Não há exclusão: correções são feitas por cancelamento, para manter o histórico.
export async function cancelEntry(id: string): Promise<FinancialEntry> {
  await wait(200);
  const { user, companyId } = await session();
  assertCan(user.role, 'finance', 'Você não tem permissão para cancelar lançamentos.');
  const entry = entries.find((e) => e.id === id && e.companyId === companyId);
  if (!entry) throw new Error('Lançamento não encontrado.');
  if (entry.status !== 'PENDING') throw new Error('Lançamentos pagos não podem ser cancelados.');
  entry.status = 'CANCELED';
  return present(entry);
}
