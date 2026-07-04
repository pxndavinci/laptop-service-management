import { Selectable } from 'kysely';
import { RoleTable } from '../db/schema';

export type Role = Selectable<RoleTable>;

export interface CreateRole {
  roleId: number;
  roleName: string;
  isServicer?: boolean;
  isCustomer?: boolean;
  isBusiness?: boolean;
}

export interface PatchRole {
  roleName?: string;
  isServicer?: boolean;
  isCustomer?: boolean;
  isBusiness?: boolean;
}
