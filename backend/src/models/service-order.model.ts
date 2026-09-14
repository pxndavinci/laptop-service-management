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
  currentStatusAt: Date | null;
}

export interface ServiceOrderQueryParams {
  tagSearch?: string;
  status?: string;
  userProductId?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  priorityLevel?: number;
  issueDescription?: IssueType;
  entryBy?: string;
  userId?: string;
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

/** Omitted fields are left unchanged; `null` clears an optional field. */
export interface PatchServiceOrder {
  userProductId?: string;
  estimatedPrice?: number | null;
  finalPrice?: number | null;
  paymentMethod?: PaymentMethod | null;
  paymentStatus?: PaymentStatus;
  priorityLevel?: number;
  estimatedCompletionDate?: string | null;
  actualCompletionDate?: string | null;
  issueDescription?: IssueType;
  issueNotes?: string | null;
}
