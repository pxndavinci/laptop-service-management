import { Role } from "./role.model";

export interface User {
  userId:string;
  userName:string;
  email:string;
  address?:string;
  role:Role;
  createdAt:string;
  updatedAt:string;
}

export interface UserQueryParams {
    userName?: string;
    email?:string;
    roleId?: number;
    page?: number;
    limit?: number;
    offset?: number;
}

export interface CreateUser{
  userName:string;
  email:string;
  roleId:number;
}

export interface PatchUser{
  userName?:string;
  email?:string;
  roleId?:number;
}