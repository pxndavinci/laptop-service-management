import { Selectable } from 'kysely';
import { UserProductTable } from '../db/schema';

export type UserProduct = Selectable<UserProductTable>;

/** Device row plus its product, brand and type names, for display. */
export interface UserProductWithNames extends UserProduct {
  productName: string;
  brandName: string;
  productTypeName: string;
}

export interface UserProductQueryParams {
  userId?: string;
  productId?: string;
  serialNumber?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserProduct {
  userId: string;
  productId: string;
  serialNumber: string;
  loginPassword?: string;
  additionalInfo?: string;
}

export interface PatchUserProduct {
  userId?: string;
  productId?: string;
  serialNumber?: string;
  loginPassword?: string;
  additionalInfo?: string;
}
