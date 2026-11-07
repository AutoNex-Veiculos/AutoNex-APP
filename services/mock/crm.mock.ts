import { assertCan, daysAgo, session, uid, wait } from '@/services/mock/store';
import { vehicleLabel } from '@/services/mock/vehicles.mock';
import { STAGE_LABELS, stageTargets } from '@/constants/crm';
import type { Customer, Lead, LeadNote, LeadPayload, LeadStage } from '@/types/crm';

type DbCustomer = Customer & { companyId: string };
type DbLead = Omit<Lead, 'customer' | 'vehicleLabel'> & { companyId: string; customerId: string };

const customers: DbCustomer[] = [
  { id: 'cu1', companyId: 'c1', name: 'Marcos Oliveira', type: 'PERSON', phone: '(11) 98877-1020', email: 'marcos.oliveira@email.com', createdAt: daysAgo(12) },
  { id: 'cu2', companyId: 'c1', name: 'Fernanda Lima', type: 'PERSON', phone: '(11) 97766-3344', createdAt: daysAgo(8) },
  { id: 'cu3', companyId: 'c1', name: 'Transportes Aurora Ltda', type: 'COMPANY', document: '12345678000190', phone: '(11) 3322-1100', email: 'compras@aurora.com.br', createdAt: daysAgo(16) },
  { id: 'cu4', companyId: 'c1', name: 'Ricardo Alves', type: 'PERSON', phone: '(11) 95544-8899', createdAt: daysAgo(2) },
  { id: 'cu5', companyId: 'c1', name: 'Camila Duarte', type: 'PERSON', phone: '(11) 94433-7788', email: 'camila.duarte@email.com', createdAt: daysAgo(20) },
  { id: 'cu6', companyId: 'c1', name: 'Paulo Henrique Ramos', type: 'PERSON', phone: '(11) 93322-5566', createdAt: daysAgo(4) },
  { id: 'cu7', companyId: 'c1', name: 'Aline Barros', type: 'PERSON', phone: '(11) 92211-4433', createdAt: daysAgo(35) },
];

const note = (text: string, authorName: string, days: number): LeadNote => ({ id: uid('n'), text, authorName, createdAt: daysAgo(days) });

const leads: DbLead[] = [
  { id: 'l1', companyId: 'c1', customerId: 'cu1', vehicleId: 'v1', source: 'Instagram', stage: 'NEGOTIATION', responsibleName: 'Rafael Souza', createdAt: daysAgo(12), notes: [note('Pediu desconto e avaliação do carro na troca.', 'Rafael Souza', 3), note('Visitou a loja no sábado.', 'Rafael Souza', 8)] },
  { id: 'l2', companyId: 'c1', customerId: 'cu2', vehicleId: 'v3', source: 'WhatsApp', stage: 'VISIT', responsibleName: 'Rafael Souza', createdAt: daysAgo(8), notes: [note('Visita marcada para quinta à tarde.', 'Rafael Souza', 1)] },
  { id: 'l3', companyId: 'c1', customerId: 'cu3', vehicleId: 'v4', source: 'Indicação', stage: 'PROPOSAL', responsibleName: 'Juliana Prado', createdAt: daysAgo(16), notes: [note('Empresa quer a caminhonete para a frota de entregas.', 'Juliana Prado', 10)] },
  { id: 'l4', companyId: 'c1', customerId: 'cu4', vehicleId: 'v5', source: 'Vitrine', stage: 'NEW', responsibleName: 'Rafael Souza', createdAt: daysAgo(2), notes: [] },
  { id: 'l5', companyId: 'c1', customerId: 'cu5', vehicleId: 'v2', source: 'Loja física', stage: 'WON', responsibleName: 'Rafael Souza', createdAt: daysAgo(20), notes: [note('Fechou a compra do Civic.', 'Rafael Souza', 6)] },
  { id: 'l6', companyId: 'c1', customerId: 'cu6', vehicleId: 'v6', source: 'Portal de anúncios', stage: 'CONTACTED', responsibleName: 'Juliana Prado', createdAt: daysAgo(4), notes: [] },
];

function present(lead: DbLead): Lead {
  const { companyId, customerId, ...rest } = lead;
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) throw new Error('Cliente não encontrado.');
  const { companyId: _c, ...publicCustomer } = customer;
  return { ...rest, customer: publicCustomer, vehicleLabel: lead.vehicleId ? vehicleLabel(companyId, lead.vehicleId) : undefined };
}

const digits = (s: string) => s.replace(/\D/g, '');

// Cria o lead e reaproveita o cliente quando o telefone já existe (evita duplicidade).
export function createLeadInternal(companyId: string, payload: LeadPayload, responsibleName: string): Lead {
  let customer = customers.find((c) => c.companyId === companyId && digits(c.phone) === digits(payload.phone));
  if (!customer) {
    customer = {
      id: uid('cu'),
      companyId,
      name: payload.name,
      type: payload.type,
      document: payload.document,
      phone: payload.phone,
      email: payload.email,
      createdAt: new Date().toISOString(),
    };
    customers.push(customer);
  }
  const lead: DbLead = {
    id: uid('l'),
    companyId,
    customerId: customer.id,
    vehicleId: payload.vehicleId,
    source: payload.source,
    stage: 'NEW',
    responsibleName,
    createdAt: new Date().toISOString(),
    notes: payload.note ? [{ id: uid('n'), text: payload.note, authorName: responsibleName, createdAt: new Date().toISOString() }] : [],
  };
  leads.push(lead);
  return present(lead);
}

export async function listLeads(): Promise<Lead[]> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'customers', 'Você não tem permissão para ver clientes.');
  return leads.filter((l) => l.companyId === companyId).map(present).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLead(id: string): Promise<Lead> {
  await wait(200);
  const { user, companyId } = await session();
  assertCan(user.role, 'customers', 'Você não tem permissão para ver clientes.');
  const lead = leads.find((l) => l.id === id && l.companyId === companyId);
  if (!lead) throw new Error('Lead não encontrado.');
  return present(lead);
}

export async function createLead(payload: LeadPayload): Promise<Lead> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'customers', 'Você não tem permissão para cadastrar clientes.');
  return createLeadInternal(companyId, payload, user.name);
}

export async function updateLeadStage(id: string, stage: LeadStage): Promise<Lead> {
  await wait(200);
  const { user, companyId } = await session();
  assertCan(user.role, 'customers', 'Você não tem permissão para alterar leads.');
  const lead = leads.find((l) => l.id === id && l.companyId === companyId);
  if (!lead) throw new Error('Lead não encontrado.');
  if (!stageTargets(lead.stage).includes(stage)) throw new Error('Esta mudança de etapa não é permitida.');
  lead.stage = stage;
  lead.notes.push({ id: uid('n'), text: `Etapa alterada para "${STAGE_LABELS[stage]}".`, authorName: user.name, createdAt: new Date().toISOString() });
  return present(lead);
}

export async function addLeadNote(id: string, text: string): Promise<Lead> {
  await wait(200);
  const { user, companyId } = await session();
  assertCan(user.role, 'customers', 'Você não tem permissão para anotar em leads.');
  const lead = leads.find((l) => l.id === id && l.companyId === companyId);
  if (!lead) throw new Error('Lead não encontrado.');
  lead.notes.push({ id: uid('n'), text, authorName: user.name, createdAt: new Date().toISOString() });
  return present(lead);
}

export async function listCustomers(): Promise<Customer[]> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'customers', 'Você não tem permissão para ver clientes.');
  return customers
    .filter((c) => c.companyId === companyId)
    .map(({ companyId: _c, ...c }) => c)
    .sort((a, b) => a.name.localeCompare(b.name));
}
