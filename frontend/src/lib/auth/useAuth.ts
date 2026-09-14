import { useQueryClient } from '@tanstack/react-query'
import { getGetAuthMeQueryKey, useGetAuthMe, usePostAuthLogout } from '../../api/auth/auth'
import { apiErrorStatus } from '../api/errors'

/** Session state from GET /auth/me. `user` is null when logged out. */
export const useAuth = () => {
  const { data, isLoading, error } = useGetAuthMe({
    query: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false },
  })
  const loggedOut = apiErrorStatus(error) === 401
  return {
    user: loggedOut ? null : (data ?? null),
    isLoading,
    // A non-401 failure (server down) should not look like "logged out"
    isError: !!error && !loggedOut,
  }
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const logout = usePostAuthLogout()
  return async () => {
    try {
      await logout.mutateAsync()
    } finally {
      const meKey = getGetAuthMeQueryKey()
      // Drop every cached response so nothing from the session lingers, then
      // mark the session as ended; RequireAuth redirects to /login.
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== meKey[0] })
      queryClient.setQueryData(meKey, null)
    }
  }
}
