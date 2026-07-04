import { Selectable } from 'kysely';
import { ProductTypeTable } from '../db/schema';

export type ProductType = Selectable<ProductTypeTable>;

export interface CreateProductType {
  typeName: string;
}

export interface PatchProductType {
  typeName?: string;
}
