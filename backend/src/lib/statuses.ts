/**
 * Canonical repair statuses. The `status` table stays a lookup table, but the
 * app reasons about these names (list filter, dashboard, overdue checks), so
 * the seed script guarantees they exist.
 *
 * Lifecycle: RECEIVED → IN_PROGRESS (↔ ON_HOLD) → COMPLETED → DELIVERED
 * CANCELLED can be set from any open status.
 */
export const STATUS = {
  RECEIVED: 'RECEIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type StatusName = (typeof STATUS)[keyof typeof STATUS];

export const CANONICAL_STATUSES: StatusName[] = Object.values(STATUS);

/** An order with no status entry yet is treated as RECEIVED. */
export const DEFAULT_STATUS: StatusName = STATUS.RECEIVED;

/** Terminal: the order needs no further work or follow-up. */
export const TERMINAL_STATUSES: StatusName[] = [STATUS.DELIVERED, STATUS.CANCELLED];

/**
 * Statuses where repair work is finished, so the order can no longer be
 * "overdue" (a completed order waiting for pickup is tracked separately).
 */
export const WORK_DONE_STATUSES: StatusName[] = [
  STATUS.COMPLETED,
  STATUS.DELIVERED,
  STATUS.CANCELLED,
];
