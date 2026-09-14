import dashboardRepo from '../repos/dashboard.repo';
import { DashboardMetrics } from '../models/dashboard.model';

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const [orders, transitions] = await Promise.all([
      dashboardRepo.getOrderCounts(),
      dashboardRepo.getTransitionCounts(),
    ]);
    return {
      received: {
        today: orders.receivedToday,
        week: orders.receivedWeek,
        month: orders.receivedMonth,
        year: orders.receivedYear,
      },
      open: orders.open,
      completed: { today: transitions.completedToday, week: transitions.completedWeek },
      delivered: { week: transitions.deliveredWeek },
      overdue: orders.overdue,
      awaitingPickup: orders.awaitingPickup,
    };
  },
};

export default dashboardService;
