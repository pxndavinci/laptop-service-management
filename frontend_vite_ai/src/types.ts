import { ServiceStatus } from './constants/status';
export interface Customer { id: number; name: string; phone: string; }
export interface Product { id: number; name: string; brand: string; stock: number; }
export interface ServiceOrder { id: number; customerName: string; phone: string; deviceModel: string; issue: string; status: ServiceStatus; charge: number; createdAt: string; deliveryDate?: string; }
