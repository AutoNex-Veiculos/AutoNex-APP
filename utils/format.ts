export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export function formatKm(value: number): string {
  return `${value.toLocaleString('pt-BR')} km`;
}

// Aceita "45900", "45.900", "45.900,50" e "R$ 45.900".
export function parseNumber(input: string | undefined): number | null {
  if (!input) return null;
  let s = input.replace(/R\$|\s/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// "2026-11-07" -> "07/11/2026"
export function formatDate(value: string): string {
  const date = value.length <= 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return date.toLocaleDateString('pt-BR');
}

export const todayIso = () => new Date().toISOString().slice(0, 10);

export function addDaysIso(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}
