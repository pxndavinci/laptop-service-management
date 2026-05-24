import { User } from "./user.model";
import { Product } from "./product.model";
export interface UserProduct{
	userProductId:string;
	user:User;
	product:Product;
	serialNumber:string;
	loginPassword?:string;
	additionalInfo?:string;
	createdAt:string;
	updatedAt:string;
}

export interface CreateUserProduct{
	userId:string;
	productId:string;
	serialNumber:string;
	loginPassword?:string;
	additionalInfo?:string;
}

export interface PatchUserProduct{
	userId?:string;
	productId?:string;
	serialNumber?:string;
	loginPassword?:string;
	additionalInfo?:string;
}

export interface UserProductQueryParams {
	userId?: string;
	productId?: string;
	serialNumber?: string;
	page?: number;
	limit?: number;
	offset?: number;
}
