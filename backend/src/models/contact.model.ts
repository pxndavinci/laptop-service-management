import { Selectable } from 'kysely';
import { ContactTable } from '../db/schema';

export type Contact = Selectable<ContactTable>;

export interface ContactQueryParams {
  contactNumber?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CreateContact {
  contactNumber: string;
  userId: string;
}

export interface PatchContact {
  contactNumber?: string;
  userId?: string;
}
