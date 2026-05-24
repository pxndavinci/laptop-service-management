import { UserProduct } from "./user-product.model";
import { User } from "./user.model";

export type PaymentMethod="CASH"|"CREDIT_CARD"|"DEBIT_CARD"|"ONLINE_PAYMENT"|"OTHER";
export type PaymentStatus="PENDING"|"COMPLETED"|"PARTIAL"|"REFUNDED";
export type IssueDescription="HARDWARE"|"SOFTWARE"|"NETWORK"|"OTHER";

export interface ServiceOrder{
  serviceOrderId:string;
  tagNo:number;
  userProduct:UserProduct;
  estimatedPrice?:number;
  finalPrice?:number;
  paymentMethod?:PaymentMethod;
  paymentStatus?:PaymentStatus;
  priorityLevel:number;
  estimatedCompletionDate?:string;
  actualCompletionDate?:string;
  issueDescription:IssueDescription;
  issueNotes?:string;
  entryBy:User;
  createdAt:string;
  updatedAt:string;
}

export interface CreateServiceOrder{
  userProductId:string;
  estimatedPrice?:number;
  paymentMethod?:PaymentMethod;
  paymentStatus?:PaymentStatus;
  priorityLevel:number;
  estimatedCompletionDate?:string;
  issueDescription:IssueDescription;
  issueNotes?:string;
  entryByUserId:string;
}

export interface PatchServiceOrder{
  userProductId?:string;
  estimatedPrice?:number;
  finalPrice?:number;
  paymentMethod?:PaymentMethod;
  paymentStatus?:PaymentStatus;
  priorityLevel?:number;
  estimatedCompletionDate?:string;
  actualCompletionDate?:string;
  issueDescription?:IssueDescription;
  issueNotes?:string;
}