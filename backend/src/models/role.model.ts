export interface Role {
  roleId:number;
  roleName:string;
  isServicer:boolean;
  isCustomer:boolean;
  isBusiness:boolean;
  createdAt:string;
  updatedAt:string;
}

export interface CreateRole{
  roleId: number;
  roleName:string;
  isServicer?:boolean;
  isCustomer?:boolean;
  isBusiness?:boolean;
}

export interface PatchRole{
  roleName?:string;
  isServicer?:boolean;
  isCustomer?:boolean;
  isBusiness?:boolean;
}