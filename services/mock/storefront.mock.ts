import { assertCan, session, wait } from '@/services/mock/store';
import { allCompanies } from '@/services/mock/auth.mock';
import { createLeadInternal } from '@/services/mock/crm.mock';
import { vehicleRecord, vehicleRecords } from '@/services/mock/vehicles.mock';
import type { InterestPayload, Listing, PublicStore, StorefrontSettings } from '@/types/storefront';
import type { Vehicle } from '@/types/vehicle';

const settings = new Map<string, StorefrontSettings>([
  ['c1', { storeName: 'AutoNex Demo Veículos', slug: 'autonex-demo', whatsapp: '(11) 99999-0000', about: 'Seminovos revisados, com procedência e garantia.', published: true }],
]);
const published = new Map<string, Set<string>>([['c1', new Set(['v1', 'v3', 'v5'])]]);

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function settingsFor(companyId: string): StorefrontSettings {
  const existing = settings.get(companyId);
  if (existing) return existing;
  const company = allCompanies().find((c) => c.id === companyId);
  const created: StorefrontSettings = { storeName: company?.tradeName ?? 'Minha loja', slug: slugify(company?.tradeName ?? companyId), published: false };
  settings.set(companyId, created);
  return created;
}

const idsFor = (companyId: string) => {
  let set = published.get(companyId);
  if (!set) {
    set = new Set();
    published.set(companyId, set);
  }
  return set;
};

const toListing = (companyId: string) => (record: ReturnType<typeof vehicleRecords>[number]): Listing => {
  const { companyId: _c, ...vehicle } = record;
  return { vehicle: vehicle as Vehicle, published: idsFor(companyId).has(record.id) };
};

export async function getSettings(): Promise<StorefrontSettings> {
  await wait(200);
  const { user, companyId } = await session();
  assertCan(user.role, 'marketing', 'Você não tem permissão para gerenciar a vitrine.');
  return { ...settingsFor(companyId) };
}

export async function saveSettings(payload: StorefrontSettings): Promise<StorefrontSettings> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'marketing', 'Você não tem permissão para gerenciar a vitrine.');
  if (!/^[a-z0-9-]{3,40}$/.test(payload.slug)) throw new Error('O endereço deve ter de 3 a 40 letras minúsculas, números ou hífens.');
  for (const company of allCompanies()) {
    if (company.id !== companyId && settingsFor(company.id).slug === payload.slug) throw new Error('Este endereço já está em uso.');
  }
  settings.set(companyId, { ...payload });
  return { ...payload };
}

export async function listListings(): Promise<Listing[]> {
  await wait();
  const { user, companyId } = await session();
  assertCan(user.role, 'marketing', 'Você não tem permissão para gerenciar a vitrine.');
  return vehicleRecords(companyId)
    .filter((v) => v.status !== 'ARCHIVED' && v.status !== 'SOLD')
    .map(toListing(companyId));
}

export async function setPublished(vehicleId: string, value: boolean): Promise<void> {
  await wait(150);
  const { user, companyId } = await session();
  assertCan(user.role, 'marketing', 'Você não tem permissão para gerenciar a vitrine.');
  const vehicle = vehicleRecord(companyId, vehicleId);
  if (!vehicle) throw new Error('Veículo não encontrado.');
  if (value && vehicle.status !== 'AVAILABLE') throw new Error('Só veículos disponíveis podem ser publicados.');
  if (value) idsFor(companyId).add(vehicleId);
  else idsFor(companyId).delete(vehicleId);
}

function findStore(slug: string) {
  for (const company of allCompanies()) {
    const s = settingsFor(company.id);
    if (s.slug === slug && s.published) return { companyId: company.id, settings: s };
  }
  return null;
}

// Público: sem login. Só devolve veículos disponíveis e publicados, sem custos nem placa.
export async function getPublicStore(slug: string): Promise<PublicStore> {
  await wait();
  const found = findStore(slug);
  if (!found) throw new Error('Loja não encontrada.');
  const ids = idsFor(found.companyId);
  const vehicles = vehicleRecords(found.companyId)
    .filter((v) => v.status === 'AVAILABLE' && ids.has(v.id))
    .map((v) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      version: v.version,
      yearManufacture: v.yearManufacture,
      yearModel: v.yearModel,
      mileage: v.mileage,
      color: v.color,
      fuel: v.fuel,
      transmission: v.transmission,
      price: v.price,
      description: v.description,
      imageUrl: v.imageUrl,
    }));
  return { storeName: found.settings.storeName, slug, whatsapp: found.settings.whatsapp, about: found.settings.about, vehicles };
}

export async function submitInterest(slug: string, payload: InterestPayload): Promise<void> {
  await wait();
  const found = findStore(slug);
  if (!found) throw new Error('Loja não encontrada.');
  createLeadInternal(
    found.companyId,
    { name: payload.name, type: 'PERSON', phone: payload.phone, source: 'Vitrine', vehicleId: payload.vehicleId, note: payload.message },
    'Vitrine online',
  );
}
