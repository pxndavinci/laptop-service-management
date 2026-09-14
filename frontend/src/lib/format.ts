/** Shared display formatters (prices in rupees, dates in the browser locale). */

export const formatPrice = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : `₹${value.toLocaleString('en-IN')}`

export const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString() : '—'

export const formatDateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : '—'

/** `IN_PROGRESS` → `In Progress`, `CREDIT_CARD` → `Credit Card`. */
export const humanize = (value: string | null | undefined) =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '—'

const DAY_MS = 24 * 60 * 60 * 1000

/** Whole days from `value` until now (positive when `value` is in the past). */
export const daysSince = (value: string | null | undefined) =>
  value ? Math.floor((Date.now() - new Date(value).getTime()) / DAY_MS) : 0

/** ISO timestamp → value for a `datetime-local` input, in local time. */
export const toDateTimeLocal = (value: string | null | undefined) => {
  if (!value) return ''
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}
