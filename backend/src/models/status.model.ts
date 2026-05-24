export interface Status{
  statusId:string;
  statusName:string;
  createdAt:string;
  updatedAt:string;
}

export interface CreateStatus{
  statusName:string;
}

export interface PatchStatus{
  statusName?:string;
}