import { ColumnType, Generated } from 'kysely';

/**
 * Typed mirror of schema.sql for Kysely.
 *
 * Column properties are camelCase; the CamelCasePlugin translates them to the
 * snake_case names used in the database. Table names stay snake_case so they
 * match schema.sql exactly.
 *
 * `created_at`/`updated_at` are managed by the database (defaults + triggers),
 * so they are read-only here.
 */
type Timestamp = ColumnType<Date, never, never>;

export type IssueType = 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'OTHER';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'ONLINE_PAYMENT' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'PARTIAL' | 'REFUNDED';

export interface RoleTable {
  roleId: number;
  roleName: string;
  isServicer: Generated<boolean>;
  isCustomer: Generated<boolean>;
  isBusiness: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserDataTable {
  userId: Generated<string>;
  userName: string;
  roleId: number;
  email: string | null;
  address: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ContactTable {
  contactId: Generated<string>;
  contactNumber: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BrandTable {
  brandId: Generated<string>;
  brandName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductTypeTable {
  productTypeId: Generated<string>;
  productTypeName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductTable {
  productId: Generated<string>;
  productName: string;
  description: string | null;
  brandId: string;
  productTypeId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProductTable {
  userProductId: Generated<string>;
  userId: string;
  productId: string;
  serialNumber: string;
  loginPassword: string | null;
  additionalInfo: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ServiceOrderTable {
  serviceOrderId: Generated<string>;
  /** Assigned by a database trigger (YY + running number). */
  tagNo: ColumnType<number, never, never>;
  userProductId: string;
  estimatedPrice: number | null;
  finalPrice: ColumnType<number | null, number | null | undefined, number | null>;
  paymentMethod: PaymentMethod | null;
  paymentStatus: Generated<PaymentStatus>;
  priorityLevel: Generated<number>;
  estimatedCompletionDate: ColumnType<Date | null, string | Date | null, string | Date | null>;
  actualCompletionDate: ColumnType<Date | null, string | Date | null | undefined, string | Date | null>;
  issueDescription: IssueType;
  issueNotes: string | null;
  entryBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StatusTable {
  statusId: Generated<string>;
  statusName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ServiceStatusTable {
  serviceStatusId: Generated<string>;
  serviceOrderId: string;
  statusId: string;
  assignedTo: string;
  comment: string | null;
  notifyCustomer: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Database {
  role: RoleTable;
  user_data: UserDataTable;
  contact: ContactTable;
  brand: BrandTable;
  product_type: ProductTypeTable;
  product: ProductTable;
  user_product: UserProductTable;
  service_order: ServiceOrderTable;
  status: StatusTable;
  service_status: ServiceStatusTable;
}
