import type { QueryClient } from '@tanstack/react-query'

/**
 * Orval query keys start with the request path (e.g. `/service-orders/<id>`).
 * Matching by path prefix refreshes every list, detail and dashboard view that
 * can show a changed order, without tracking each key by hand.
 */
const byPathPrefix = (queryClient: QueryClient, prefixes: string[]) =>
  queryClient.invalidateQueries({
    predicate: (query) => {
      const path = query.queryKey[0]
      return typeof path === 'string' && prefixes.some((prefix) => path.startsWith(prefix))
    },
  })

/** After any order or status change: orders, status history, dashboard. */
export const invalidateOrderQueries = (queryClient: QueryClient) =>
  byPathPrefix(queryClient, ['/service-orders', '/service-status', '/dashboard'])

/** After customer changes: customers, contacts, devices, and orders that show names. */
export const invalidateCustomerQueries = (queryClient: QueryClient) =>
  byPathPrefix(queryClient, [
    '/users',
    '/contacts',
    '/user-products',
    '/service-orders',
    '/dashboard',
  ])

/** After product/brand/type changes. */
export const invalidateProductQueries = (queryClient: QueryClient) =>
  byPathPrefix(queryClient, ['/products', '/references', '/user-products', '/service-orders'])
