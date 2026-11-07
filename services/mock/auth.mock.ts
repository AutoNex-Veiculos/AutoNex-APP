// DADOS SIMULADOS: usados apenas com EXPO_PUBLIC_USE_MOCK=true.
// Ficam em memória e são perdidos ao recarregar o app.
import { storage, TOKEN_KEY } from '@/storage';
import { can } from '@/utils/permissions';
import type { Company, Invitation, Session, User } from '@/types/auth';
import type { LoginInput, RegisterInput } from '@/utils/schemas/auth';
import type { InviteInput } from '@/utils/schemas/team';

type DbUser = User & { password: string };
type DbInvitation = Invitation & { companyId: string };

const wait = (ms = 400) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const companies: Company[] = [
  { id: 'c1', tradeName: 'AutoNex Demo', document: '00000000000191' },
  { id: 'c2', tradeName: 'Revenda Horizonte', document: '11222333000181' },
  { id: 'c3', tradeName: 'Motos e Cia', document: '45987321000155' },
];

const DEV_PASSWORD = 'AutoNex@123';

// Um usuário por perfil, usados pelos botões de acesso rápido (constants/devProfiles.ts).
const users: DbUser[] = [
  { id: 'u1', name: 'Carlos Mendes', email: 'demo@autonex.com', password: DEV_PASSWORD, role: 'OWNER', companyId: 'c1' },
  { id: 'u2', name: 'Juliana Prado', email: 'gerente@autonex.dev', password: DEV_PASSWORD, role: 'MANAGER', companyId: 'c1' },
  { id: 'u3', name: 'Rafael Souza', email: 'vendedor@autonex.dev', password: DEV_PASSWORD, role: 'SELLER', companyId: 'c1' },
  { id: 'u4', name: 'Marina Costa', email: 'financeiro@autonex.dev', password: DEV_PASSWORD, role: 'FINANCE', companyId: 'c1' },
  { id: 'u5', name: 'Bruno Tavares', email: 'marketing@autonex.dev', password: DEV_PASSWORD, role: 'MARKETING', companyId: 'c1' },
  { id: 'u6', name: 'Patrícia Lima', email: 'posvenda@autonex.dev', password: DEV_PASSWORD, role: 'AFTER_SALES', companyId: 'c1' },
  { id: 'u7', name: 'Admin AutoNex', email: 'admin@autonex.dev', password: DEV_PASSWORD, role: 'PLATFORM_ADMIN', companyId: null },
  { id: 'u8', name: 'Helena Rocha', email: 'helena@horizonte.dev', password: DEV_PASSWORD, role: 'OWNER', companyId: 'c2' },
  { id: 'u9', name: 'Diego Nunes', email: 'diego@motosecia.dev', password: DEV_PASSWORD, role: 'OWNER', companyId: 'c3' },
];

const invitations: DbInvitation[] = [];
let sequence = 100;
const nextId = (prefix: string) => `${prefix}${++sequence}`;

function toSession(user: DbUser): Session {
  const { password: _password, ...publicUser } = user;
  const company = companies.find((c) => c.id === user.companyId) ?? null;
  return { token: `mock-${user.id}`, user: publicUser, company };
}

export async function currentUser(): Promise<DbUser> {
  const token = await storage.get(TOKEN_KEY);
  const user = users.find((u) => `mock-${u.id}` === token);
  if (!user) throw new Error('Sessão expirada. Entre novamente.');
  return user;
}

export async function login({ email, password }: LoginInput): Promise<Session> {
  await wait();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!user) throw new Error('E-mail ou senha incorretos.');
  return toSession(user);
}

export async function registerCompany(input: RegisterInput): Promise<Session> {
  await wait();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Este e-mail já está cadastrado.');
  }
  const company: Company = {
    id: nextId('c'),
    tradeName: input.companyName,
    document: input.document.replace(/\D/g, ''),
  };
  companies.push(company);
  const user: DbUser = {
    id: nextId('u'),
    name: input.name,
    email: input.email,
    password: input.password,
    role: 'OWNER',
    companyId: company.id,
  };
  users.push(user);
  return toSession(user);
}

export async function me(): Promise<Pick<Session, 'user' | 'company'>> {
  await wait(200);
  const { user, company } = toSession(await currentUser());
  return { user, company };
}

export async function listInvitations(): Promise<Invitation[]> {
  await wait(250);
  const user = await currentUser();
  const now = Date.now();
  return invitations
    .filter((i) => i.companyId === user.companyId)
    .map(({ companyId: _companyId, ...invitation }) => ({
      ...invitation,
      status:
        invitation.status === 'PENDING' && new Date(invitation.expiresAt).getTime() < now
          ? 'EXPIRED'
          : invitation.status,
    }))
    .reverse();
}

export async function createInvitation(input: InviteInput): Promise<Invitation> {
  await wait();
  const user = await currentUser();
  if (!can(user.role, 'team')) throw new Error('Você não tem permissão para convidar funcionários.');
  const duplicated = invitations.some(
    (i) =>
      i.companyId === user.companyId &&
      i.status === 'PENDING' &&
      i.email.toLowerCase() === input.email.toLowerCase(),
  );
  if (duplicated) throw new Error('Já existe um convite pendente para este e-mail.');
  const invitation: DbInvitation = {
    id: nextId('i'),
    email: input.email,
    role: input.role,
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    companyId: user.companyId ?? '',
  };
  invitations.push(invitation);
  const { companyId: _companyId, ...result } = invitation;
  return result;
}

export async function cancelInvitation(id: string): Promise<void> {
  await wait(250);
  const user = await currentUser();
  const invitation = invitations.find((i) => i.id === id && i.companyId === user.companyId);
  if (!invitation) throw new Error('Convite não encontrado.');
  invitation.status = 'CANCELED';
}

export function allCompanies(): Company[] {
  return companies.map((c) => ({ ...c }));
}

export function countCompanyUsers(companyId: string): number {
  return users.filter((u) => u.companyId === companyId).length;
}
