export const SERVICE_STATUSES = ['Received', 'In Progress', 'Completed', 'Delivered'] as const;
export type ServiceStatus = typeof SERVICE_STATUSES[number];
