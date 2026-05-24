export interface Brand{
  brandId:string;
  brandName:string;
  createdAt:string;
  updatedAt:string;
}

export interface CreateBrand{
  brandName:string;
}

export interface PatchBrand{
  brandName?:string;
}