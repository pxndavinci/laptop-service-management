import { ServiceOrder } from "./service-order.model";
import { Status } from "./status.model";
import { User } from "./user.model";

export interface ServiceStatus {
  serviceStatusId: string; // UUID

  serviceOrder: ServiceOrder;

  status: Status;

  assignedTo: User;

  comment?: string; // Status update comments

  notifyCustomer: boolean; // default: false

  createdAt: string; // ISO 8601 date-time

  updatedAt: string; // ISO 8601 date-time
}

export interface CreateServiceStatus {
  serviceOrderId: string; // UUID

  statusId: string; // UUID

  assignedTo: string; // UUID

  comment?: string;

  notifyCustomer?: boolean;
}

export interface PatchServiceStatus {
  serviceOrderId?: string; // UUID

  statusId?: string; // UUID

  assignedTo?: string; // UUID

  comment?: string;

  notifyCustomer?: boolean;
}