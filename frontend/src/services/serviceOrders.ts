import { apiClient } from '../api/client';

export type ServiceOrder = {
  id: number;
  customerName: string;
  phone: string;
  deviceModel: string;
  problem: string;
  status: string;
  serviceCharge: number;
  createdAt?: string;
};

export async function fetchServiceOrders(): Promise<ServiceOrder[]> {
  const { data } = await apiClient.get('/service-orders');
  return Array.isArray(data) ? data : data?.items || [];
}
