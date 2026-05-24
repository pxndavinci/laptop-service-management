export interface ProductType{
  productTypeId:string;
  typeName:string;
  createdAt:string;
  updatedAt:string;
}

export interface CreateProductType{
  typeName:string;
}

export interface PatchProductType{
  typeName?:string;
}