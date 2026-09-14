import { Selectable } from 'kysely';
import { UserDataTable } from '../db/schema';

export type User = Selectable<UserDataTable>;

/** User row plus the first contact number, for lists. */
export interface UserWithContact extends User {
  contactNumber: string | null;
}

export interface UserQueryParams {
  userName?: string;
  email?: string;
  roleId?: number;
  page?: number;
  limit?: number;
}

export interface CreateUser {
  userName: string;
  roleId: number;
  email?: string;
  address?: string;
}

/** Omitted fields are unchanged; `null` clears email or address. */
export interface PatchUser {
  userName?: string;
  email?: string | null;
  address?: string | null;
  roleId?: number;
}
