import { Selectable } from 'kysely';
import { ProductTable } from '../db/schema';

export type Product = Selectable<ProductTable>;

/** Product row plus its brand and type names, for listing. */
export interface ProductWithNames extends Product {
  brandName: string;
  productTypeName: string;
}

export interface ProductQueryParams {
  productName?: string;
  brandId?: string;
  productTypeId?: string;
  page?: number;
  limit?: number;
}

export interface CreateProduct {
  productName: string;
  description?: string;
  brandId: string;
  productTypeId: string;
}

export interface PatchProduct {
  productName?: string;
  description?: string;
  brandId?: string;
  productTypeId?: string;
}
