import { User } from './user.model';

export interface ContactQueryParams {
  contactNumber?: string;
  userId?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface Contact {
  contactId: string;
  contactNumber: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContact{
  contactNumber:string;
  userId:string;
}

export interface PatchContact{
  contactNumber?:string;
  userId?:string;
}