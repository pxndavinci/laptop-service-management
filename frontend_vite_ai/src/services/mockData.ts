import { Customer, Product, ServiceOrder } from '../types';
export const customers: Customer[] = [
  { id: 1, name: 'John Carter', phone: '555-0121' },
  { id: 2, name: 'Ava Smith', phone: '555-0142' }
];
export const products: Product[] = [
  { id: 1, name: 'SSD 512GB', brand: 'Samsung', stock: 12 },
  { id: 2, name: 'Laptop Adapter 65W', brand: 'Dell', stock: 8 }
];
export const serviceOrders: ServiceOrder[] = [
  { id: 101, customerName: 'John Carter', phone: '555-0121', deviceModel: 'HP Pavilion 14', issue: 'No power', status: 'In Progress', charge: 80, createdAt: '2026-05-24' },
  { id: 102, customerName: 'Ava Smith', phone: '555-0142', deviceModel: 'Lenovo ThinkPad E14', issue: 'Blue screen', status: 'Received', charge: 50, createdAt: '2026-05-26' }
];
