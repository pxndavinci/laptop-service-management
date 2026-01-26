// Types for Laptop Service Management System

export type ServiceStatus =
  | "CREATED"
  | "RECEIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELIVERED"
  | "CANCELLED"

export type IssueType = "HARDWARE" | "SOFTWARE" | "NETWORK" | "OTHER"

export type PaymentStatus = "PENDING" | "COMPLETED" | "PARTIAL" | "REFUNDED"

export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "ONLINE_PAYMENT"
  | "OTHER"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  createdAt: string
}

export interface Brand {
  id: string
  name: string
}

export interface ProductType {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  brand: Brand
  productType: ProductType
  description?: string
}

export interface UserProduct {
  id: string
  user: User
  product: Product
  serialNumber: string
  additionalInfo?: string
}

export interface TimelineEntry {
  id: string
  status: ServiceStatus
  timestamp: string
  note?: string
  updatedBy?: string
}

export interface ServiceOrder {
  id: string
  tagNo: string
  userProduct: UserProduct
  issueType: IssueType
  issueNotes?: string
  status: ServiceStatus
  priorityLevel: number
  estimatedPrice?: number
  finalPrice?: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  estimatedCompletionDate?: string
  actualCompletionDate?: string
  timeline: TimelineEntry[]
  createdAt: string
  updatedAt: string
}
