import { Selectable } from 'kysely';
import { ServiceStatusTable } from '../db/schema';

export type ServiceStatus = Selectable<ServiceStatusTable>;

/** Status history entry plus display names, for timelines. */
export interface ServiceStatusWithNames extends ServiceStatus {
  statusName: string;
  assignedToName: string;
}

export interface ServiceStatusQueryParams {
  serviceOrderId?: string;
  page?: number;
  limit?: number;
}

export interface CreateServiceStatus {
  serviceOrderId: string;
  statusId: string;
  assignedTo: string;
  comment?: string;
  notifyCustomer?: boolean;
}

export interface PatchServiceStatus {
  statusId?: string;
  assignedTo?: string;
  comment?: string;
  notifyCustomer?: boolean;
}
