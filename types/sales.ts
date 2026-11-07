export type ProposalStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONVERTED'
  | 'CANCELED';

export type ProposalAction = 'approve' | 'send' | 'accept' | 'reject' | 'cancel' | 'close';

export interface ProposalEvent {
  at: string;
  text: string;
}

export interface Proposal {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleLabel: string;
  sellerName: string;
  listedPrice: number;
  offeredValue: number;
  paymentCondition: string;
  tradeIn?: string;
  validUntil: string;
  notes?: string;
  status: ProposalStatus;
  requiresApproval: boolean;
  history: ProposalEvent[];
  createdAt: string;
  saleId?: string;
}

export interface ProposalPayload {
  customerId: string;
  vehicleId: string;
  offeredValue: number;
  paymentCondition: string;
  tradeIn?: string;
  validUntil: string;
  notes?: string;
}

export interface Sale {
  id: string;
  proposalId: string;
  customerName: string;
  vehicleId: string;
  vehicleLabel: string;
  sellerName: string;
  saleValue: number;
  commissionRate: number;
  commission: number;
  closedAt: string;
}
