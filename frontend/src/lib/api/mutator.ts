import Axios, { AxiosError, AxiosRequestConfig } from 'axios'

/**
 * Query strings with %20 for spaces. Axios' default (URLSearchParams) writes
 * spaces as '+', which express-openapi-validator rejects as a reserved
 * character — so any search containing a space ("Ravi Kumar") failed with 400.
 */
const serializeParams = (params: Record<string, unknown>) =>
  Object.entries(params)
    .flatMap(([key, value]) =>
      (Array.isArray(value) ? value : [value])
        .filter((item) => item !== undefined && item !== null && item !== '')
        .map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`),
    )
    .join('&')

/** Single axios instance used by every orval-generated hook. */
export const AXIOS_INSTANCE = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  // Send the httpOnly session cookie with every request
  withCredentials: true,
  paramsSerializer: { serialize: (params) => serializeParams(params) },
})

let onUnauthorized: (() => void) | null = null

/** Called when any request (other than login itself) comes back 401. */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler
}

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthCall = error.config?.url?.startsWith('/auth/')
    if (error.response?.status === 401 && !isAuthCall) onUnauthorized?.()
    return Promise.reject(error)
  },
)

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return AXIOS_INSTANCE({ ...config, ...options }).then(({ data }) => data)
}
