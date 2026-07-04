import { Selectable } from 'kysely';
import { BrandTable } from '../db/schema';

export type Brand = Selectable<BrandTable>;

export interface CreateBrand {
  brandName: string;
}

export interface PatchBrand {
  brandName?: string;
}
