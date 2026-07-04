import { Selectable } from 'kysely';
import { IssueType, PaymentMethod, PaymentStatus, ServiceOrderTable } from '../db/schema';

export type ServiceOrder = Selectable<ServiceOrderTable>;

/** Service order row plus customer/device context for lists and details. */
export interface ServiceOrderSummary extends ServiceOrder {
  userId: string;
  userName: string;
  contactNumber: string | null;
  productName: string;
  brandName: string;
  serialNumber: string;
  currentStatus: string | null;
}

export interface ServiceOrderQueryParams {
  tagNo?: number;
  userProductId?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  priorityLevel?: number;
  issueDescription?: IssueType;
  entryBy?: string;
  page?: number;
  limit?: number;
}

export interface CreateServiceOrder {
  userProductId: string;
  estimatedPrice?: number;
  priorityLevel?: number;
  estimatedCompletionDate?: string;
  issueDescription: IssueType;
  issueNotes?: string;
  entryBy: string;
}

export interface PatchServiceOrder {
  userProductId?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  priorityLevel?: number;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  issueDescription?: IssueType;
  issueNotes?: string;
}
