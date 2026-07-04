import { Selectable } from 'kysely';
import {
  BrandTable,
  ContactTable,
  IssueType,
  ProductTypeTable,
  UserDataTable,
  UserProductTable,
} from '../db/schema';
import { ServiceOrder } from './service-order.model';

export interface ServiceOrderComposerSearchParams {
  userName?: string;
  contactNumber?: string;
  email?: string;
  productName?: string;
  brandName?: string;
  productTypeName?: string;
  serialNumber?: string;
  limit?: number;
}

export type ComposerUser = Pick<
  Selectable<UserDataTable>,
  'userId' | 'userName' | 'email' | 'address' | 'roleId'
>;

export type ComposerContact = Pick<Selectable<ContactTable>, 'contactId' | 'contactNumber'>;

export type ComposerBrand = Pick<Selectable<BrandTable>, 'brandId' | 'brandName'>;

export type ComposerProductType = Pick<
  Selectable<ProductTypeTable>,
  'productTypeId' | 'productTypeName'
>;

export interface ComposerProduct {
  productId: string;
  productName: string;
  description: string | null;
  brand: ComposerBrand;
  productType: ComposerProductType;
}

export type ComposerUserProduct = Pick<
  Selectable<UserProductTable>,
  'userProductId' | 'serialNumber' | 'loginPassword' | 'additionalInfo'
>;

/** One customer/device pairing offered as a suggestion in the order form. */
export interface ServiceOrderComposerSearchResult {
  user: ComposerUser;
  contacts: ComposerContact[];
  product?: ComposerProduct;
  userProduct?: ComposerUserProduct;
}

export interface ExistingEntityReferences {
  userId?: string | null;
  contactId?: string | null;
  brandId?: string | null;
  productTypeId?: string | null;
  productId?: string | null;
  userProductId?: string | null;
}

export interface ComposeCustomerInput {
  userName: string;
  roleId: number;
  email?: string;
  address?: string;
}

export interface ComposeContactInput {
  contactNumber: string;
}

export interface ComposeProductInput {
  productName: string;
  description?: string;
  brandName: string;
  productTypeName: string;
}

export interface ComposeUserProductInput {
  serialNumber: string;
  loginPassword?: string;
  additionalInfo?: string;
}

export interface ComposeServiceOrderInput {
  estimatedPrice?: number;
  estimatedCompletionDate?: string;
  priorityLevel: number;
  issueDescription: IssueType;
  issueNotes?: string;
  entryByUserId: string;
}

export interface ComposeServiceOrderRequest {
  existing: ExistingEntityReferences;
  customer: ComposeCustomerInput;
  contact: ComposeContactInput;
  product: ComposeProductInput;
  userProduct: ComposeUserProductInput;
  serviceOrder: ComposeServiceOrderInput;
}

export interface CreatedEntitiesSummary {
  userCreated: boolean;
  contactCreated: boolean;
  brandCreated: boolean;
  productTypeCreated: boolean;
  productCreated: boolean;
  userProductCreated: boolean;
}

export interface ComposeServiceOrderResponse {
  serviceOrder: ServiceOrder;
  createdEntities: CreatedEntitiesSummary;
}
