import { isAxiosError } from 'axios'

/** The API's `{ error }` message, or a fallback when the request failed otherwise. */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { error?: unknown } | undefined)?.error
    if (typeof message === 'string' && message) return message
    if (!error.response) return 'Cannot reach the server. Check your connection.'
  }
  return fallback
}

export const apiErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined
