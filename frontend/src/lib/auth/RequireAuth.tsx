import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { getGetAuthMeQueryKey } from '../../api/auth/auth'
import { setUnauthorizedHandler } from '../api/mutator'
import { useAuth } from './useAuth'

/** Renders child routes only for a logged-in user; otherwise redirects to /login. */
export const RequireAuth = () => {
  const { user, isLoading, isError } = useAuth()
  const location = useLocation()
  const queryClient = useQueryClient()

  // Any 401 mid-session (expired token, password changed) re-checks /auth/me,
  // which flips `user` to null and redirects to the login page.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() })
    })
    return () => setUnauthorizedHandler(null)
  }, [queryClient])

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          Cannot reach the server.
        </Alert>
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}
