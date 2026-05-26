import { serviceOrders } from './mockData';
export const getDashboardStats = () => ({
  totalOrders: serviceOrders.length,
  inProgress: serviceOrders.filter((o) => o.status === 'In Progress').length,
  completed: serviceOrders.filter((o) => o.status === 'Completed').length,
  todayEntries: serviceOrders.filter((o) => o.createdAt === '2026-05-26').length
});
