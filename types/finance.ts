export type EntryType = 'RECEIVABLE' | 'PAYABLE';
export type EntryStatus = 'PENDING' | 'PAID' | 'CANCELED';

export interface FinancialEntry {
  id: string;
  type: EntryType;
  description: string;
  category: string;
  amount: number;
  /** Data no formato AAAA-MM-DD. */
  dueDate: string;
  paidAt?: string;
  status: EntryStatus;
  vehicleId?: string;
  vehicleLabel?: string;
  /** Preenchido quando o lançamento nasce de uma venda (evita duplicidade). */
  saleId?: string;
  createdAt: string;
}

export interface EntryPayload {
  type: EntryType;
  description: string;
  category: string;
  amount: number;
  dueDate: string;
  vehicleId?: string;
}
