export type CaseType = 'DELIVERY' | 'FOLLOW_UP' | 'COMPLAINT' | 'REQUEST';
export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface AfterSalesCase {
  id: string;
  type: CaseType;
  title: string;
  description?: string;
  customerName: string;
  vehicleLabel: string;
  saleId?: string;
  status: CaseStatus;
  dueDate: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface CasePayload {
  type: CaseType;
  title: string;
  description?: string;
  customerName: string;
  vehicleLabel: string;
  saleId?: string;
  dueDate: string;
}
