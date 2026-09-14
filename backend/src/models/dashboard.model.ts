export interface DashboardMetrics {
  received: { today: number; week: number; month: number; year: number };
  open: number;
  completed: { today: number; week: number };
  delivered: { week: number };
  overdue: number;
  awaitingPickup: number;
}
