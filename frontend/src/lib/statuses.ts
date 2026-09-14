/** Canonical repair statuses (mirrors backend/src/lib/statuses.ts). */
export const STATUS = {
  RECEIVED: 'RECEIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const

/** Lifecycle order, used to sort status dropdowns. Unknown names sort last. */
const ORDER: string[] = Object.values(STATUS)

export const sortStatuses = <T extends { statusName?: string }>(statuses: T[]) =>
  [...statuses].sort(
    (a, b) =>
      (ORDER.indexOf(a.statusName ?? '') + 1 || 99) - (ORDER.indexOf(b.statusName ?? '') + 1 || 99),
  )

export type ChipColor =
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

export const STATUS_COLORS: Record<string, ChipColor> = {
  RECEIVED: 'default',
  IN_PROGRESS: 'info',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
  DELIVERED: 'primary',
  CANCELLED: 'error',
}

/** Priority 1 is most urgent. */
export const PRIORITY_COLORS: Record<number, ChipColor> = {
  1: 'error',
  2: 'warning',
  3: 'info',
  4: 'success',
  5: 'default',
}
