import { Selectable } from 'kysely';
import { UserProductTable } from '../db/schema';

export type UserProduct = Selectable<UserProductTable>;

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
