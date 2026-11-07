export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED';

export interface PlanLimits {
  users: number;
  vehicles: number;
  storageGb: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  limits: PlanLimits;
}

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  planId: string;
  planName: string;
  trialEndsAt?: string;
  daysLeft?: number;
  limits: PlanLimits;
  usage: PlanLimits;
  plans: Plan[];
}

export interface AdminCompany {
  id: string;
  tradeName: string;
  document: string;
  status: SubscriptionStatus;
  planName: string;
  users: number;
  vehicles: number;
}
