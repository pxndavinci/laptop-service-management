import { Selectable } from 'kysely';
import { StatusTable } from '../db/schema';

export type Status = Selectable<StatusTable>;

export interface CreateStatus {
  statusName: string;
}

export interface PatchStatus {
  statusName?: string;
}
