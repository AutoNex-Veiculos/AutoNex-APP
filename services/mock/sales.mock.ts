import { assertCan, daysAgo, dateOffset, session, today, uid, wait } from '@/services/mock/store';
import { forceVehicleStatus, vehicleLabel, vehicleRecord } from '@/services/mock/vehicles.mock';
import { createReceivableForSale } from '@/services/mock/finance.mock';
import { createDeliveryCase } from '@/services/mock/aftersales.mock';
import { listCustomers } from '@/services/mock/crm.mock';
import {
  ACTION_LABELS,
  ACTION_PERMISSION,
  ACTION_RESULT,
  COMMISSION_RATE,
  DISCOUNT_LIMIT_PERCENT,
  STATUS_ACTIONS,
} from '@/constants/sales';
import type { Proposal, ProposalAction, ProposalPayload, Sale } from '@/types/sales';

type DbProposal = Proposal & { companyId: string };
type DbSale = Sale & { companyId: string };

const ev = (days: number, text: string) => ({ at: daysAgo(days), text });

const proposals: DbProposal[] = [
  { id: 'p1', companyId: 'c1', customerId: 'cu2', customerName: 'Fernanda Lima', vehicleId: 'v3', vehicleLabel: 'Volkswagen T-Cross Highline 250 TSI 2022', sellerName: 'Rafael Souza', listedPrice: 124900, offeredValue: 119900, paymentCondition: 'Financiamento', validUntil: dateOffset(6), status: 'DRAFT', requiresApproval: false, history: [ev(1, 'Proposta criada por Rafael Souza.')], createdAt: daysAgo(1) },
  { id: 'p2', companyId: 'c1', customerId: 'cu3', customerName: 'Transportes Aurora Ltda', vehicleId: 'v4', vehicleLabel: 'Fiat Toro Volcano 2.0 Diesel 4x4 2021', sellerName: 'Juliana Prado', listedPrice: 139900, offeredValue: 126000, paymentCondition: 'À vista', validUntil: dateOffset(4), status: 'SENT', requiresApproval: true, history: [ev(5, 'Proposta criada por Juliana Prado.'), ev(4, 'Desconto aprovado por Carlos Mendes.'), ev(3, 'Proposta enviada ao cliente.')], createdAt: daysAgo(5) },
  { id: 'p3', companyId: 'c1', customerId: 'cu1', customerName: 'Marcos Oliveira', vehicleId: 'v2', vehicleLabel: 'Honda Civic Touring 1.5 Turbo 2019', sellerName: 'Rafael Souza', listedPrice: 109900, offeredValue: 107500, paymentCondition: 'À vista com troca', tradeIn: 'Fiat Argo 2018, 60 mil km', validUntil: dateOffset(2), status: 'ACCEPTED', requiresApproval: false, history: [ev(7, 'Proposta criada por Rafael Souza.'), ev(6, 'Proposta enviada ao cliente.'), ev(2, 'Cliente aceitou. Veículo reservado.')], createdAt: daysAgo(7) },
  { id: 'p4', companyId: 'c1', customerId: 'cu7', customerName: 'Aline Barros', vehicleId: 'v7', vehicleLabel: 'Hyundai HB20 Comfort 1.0 2019', sellerName: 'Rafael Souza', listedPrice: 51900, offeredValue: 50900, paymentCondition: 'Financiamento', validUntil: dateOffset(-12), status: 'CONVERTED', requiresApproval: false, history: [ev(18, 'Proposta criada por Rafael Souza.'), ev(14, 'Cliente aceitou. Veículo reservado.'), ev(12, 'Venda fechada.')], createdAt: daysAgo(18), saleId: 's1' },
];

const sales: DbSale[] = [
  { id: 's1', companyId: 'c1', proposalId: 'p4', customerName: 'Aline Barros', vehicleId: 'v7', vehicleLabel: 'Hyundai HB20 Comfort 1.0 2019', sellerName: 'Rafael Souza', saleValue: 50900, commissionRate: COMMISSION_RATE, commission: 1018, closedAt: daysAgo(12) },
];

const strip = ({ companyId: _c, ...rest }: DbProposal): Proposal => rest;
const stripSale = ({ companyId: _c, ...rest }: DbSale): Sale => rest;
const discountPercent = (listed: number, offered: number) => ((listed - offered) / listed) * 100;

export async function listProposals(): Promise<Proposal[]> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'sales', 'Você não tem permissão para ver vendas.');
  return proposals.filter((p) => p.companyId === companyId).map(strip).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProposal(id: string): Promise<Proposal> {
  await wait(200);
  const { user, companyId } = await session();
  assertCan(user.role, 'sales', 'Você não tem permissão para ver vendas.');
  const found = proposals.find((p) => p.id === id && p.companyId === companyId);
  if (!found) throw new Error('Proposta não encontrada.');
  return strip(found);
}

export async function listSales(): Promise<Sale[]> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'sales', 'Você não tem permissão para ver vendas.');
  return sales.filter((s) => s.companyId === companyId).map(stripSale).sort((a, b) => b.closedAt.localeCompare(a.closedAt));
}

export async function createProposal(payload: ProposalPayload): Promise<Proposal> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'sales', 'Você não tem permissão para criar propostas.');
  const vehicle = vehicleRecord(companyId, payload.vehicleId);
  if (!vehicle) throw new Error('Veículo não encontrado.');
  if (vehicle.status !== 'AVAILABLE' && vehicle.status !== 'NEGOTIATING') {
    throw new Error('Só é possível propor venda de veículos disponíveis ou em negociação.');
  }
  const customer = (await listCustomers()).find((c) => c.id === payload.customerId);
  if (!customer) throw new Error('Cliente não encontrado.');
  if (payload.offeredValue <= 0) throw new Error('O valor da proposta deve ser maior que zero.');
  if (payload.validUntil < today()) throw new Error('A validade não pode estar no passado.');

  const requiresApproval = discountPercent(vehicle.price, payload.offeredValue) > DISCOUNT_LIMIT_PERCENT;
  const created: DbProposal = {
    ...payload,
    id: uid('p'),
    companyId,
    customerName: customer.name,
    vehicleLabel: vehicleLabel(companyId, vehicle.id),
    sellerName: user.name,
    listedPrice: vehicle.price,
    status: requiresApproval ? 'PENDING_APPROVAL' : 'DRAFT',
    requiresApproval,
    history: [
      { at: new Date().toISOString(), text: `Proposta criada por ${user.name}.` },
      ...(requiresApproval ? [{ at: new Date().toISOString(), text: `Desconto acima de ${DISCOUNT_LIMIT_PERCENT}%: aguardando aprovação.` }] : []),
    ],
    createdAt: new Date().toISOString(),
  };
  proposals.push(created);
  return strip(created);
}

export async function runProposalAction(id: string, action: ProposalAction): Promise<Proposal> {
  await wait(250);
  const { user, companyId } = await session();
  assertCan(user.role, 'sales', 'Você não tem permissão para alterar propostas.');
  const permission = ACTION_PERMISSION[action];
  if (permission) assertCan(user.role, permission, 'Só gerente ou proprietário pode aprovar descontos.');

  const proposal = proposals.find((p) => p.id === id && p.companyId === companyId);
  if (!proposal) throw new Error('Proposta não encontrada.');
  if (proposal.saleId && action === 'close') throw new Error('Esta venda já foi fechada.');
  if (!STATUS_ACTIONS[proposal.status].includes(action)) throw new Error('Esta ação não é permitida no status atual da proposta.');

  const vehicle = vehicleRecord(companyId, proposal.vehicleId);
  if (!vehicle) throw new Error('Veículo não encontrado.');
  const at = new Date().toISOString();

  if (action === 'accept') {
    if (vehicle.status !== 'AVAILABLE' && vehicle.status !== 'NEGOTIATING') {
      throw new Error('O veículo não está mais disponível para reserva.');
    }
    forceVehicleStatus(companyId, vehicle.id, 'RESERVED');
  }

  if (action === 'cancel' && proposal.status === 'ACCEPTED' && vehicle.status === 'RESERVED') {
    forceVehicleStatus(companyId, vehicle.id, 'AVAILABLE');
  }

  if (action === 'close') {
    if (vehicle.status === 'SOLD') throw new Error('Este veículo já foi vendido.');
    const sale: DbSale = {
      id: uid('s'),
      companyId,
      proposalId: proposal.id,
      customerName: proposal.customerName,
      vehicleId: proposal.vehicleId,
      vehicleLabel: proposal.vehicleLabel,
      sellerName: proposal.sellerName,
      saleValue: proposal.offeredValue,
      commissionRate: COMMISSION_RATE,
      commission: Math.round(proposal.offeredValue * COMMISSION_RATE * 100) / 100,
      closedAt: at,
    };
    sales.push(sale);
    forceVehicleStatus(companyId, vehicle.id, 'SOLD');
    createReceivableForSale(companyId, stripSale(sale));
    createDeliveryCase(companyId, stripSale(sale));
    proposal.saleId = sale.id;
  }

  proposal.status = ACTION_RESULT[action];
  proposal.history.push({ at, text: `${ACTION_LABELS[action]} por ${user.name}.` });
  return strip(proposal);
}
