import { Brand } from "./brand.model";
import { ProductType } from "./product-type.model";

export interface ProductQueryParams {
  productName?: string;
  brandId?: string;
  productTypeId?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface Product{
  productId:string;
  productName:string;
  description?:string;
  brand:Brand;
  productType:ProductType;
  createdAt:string;
  updatedAt:string;
}

export interface CreateProduct{
  productName:string;
  description?:string;
  brandId:string;
  productTypeId:string;
}

export interface PatchProduct{
  productName?:string;
  description?:string;
  brandId?:string;
  productTypeId?:string;
}