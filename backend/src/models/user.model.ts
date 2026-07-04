import { Selectable } from 'kysely';
import { UserDataTable } from '../db/schema';

export type User = Selectable<UserDataTable>;

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

export interface PatchUser {
  userName?: string;
  email?: string;
  address?: string;
  roleId?: number;
}
