export type LeadStage = 'NEW' | 'CONTACTED' | 'VISIT' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type CustomerType = 'PERSON' | 'COMPANY';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  document?: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface LeadNote {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  customer: Customer;
  vehicleId?: string;
  vehicleLabel?: string;
  source: string;
  stage: LeadStage;
  responsibleName: string;
  notes: LeadNote[];
  createdAt: string;
}

export interface LeadPayload {
  name: string;
  type: CustomerType;
  document?: string;
  phone: string;
  email?: string;
  source: string;
  vehicleId?: string;
  note?: string;
}
