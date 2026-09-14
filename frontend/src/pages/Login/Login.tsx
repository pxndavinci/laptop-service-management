import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import LogoIcon from '@mui/icons-material/AssignmentTurnedIn'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { getGetAuthMeQueryKey, usePostAuthLogin } from '../../api/auth/auth'
import { apiErrorMessage } from '../../lib/api/errors'
import { useAuth } from '../../lib/auth/useAuth'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
})
type LoginForm = z.infer<typeof loginSchema>

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const login = usePostAuthLogin()
  const from = (location.state as { from?: string } | null)?.from || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  if (user) return <Navigate to={from} replace />

  const onSubmit = async (data: LoginForm) => {
    try {
      const me = await login.mutateAsync({ data })
      queryClient.setQueryData(getGetAuthMeQueryKey(), me)
      navigate(from, { replace: true })
    } catch {
      // error shown from login.error below
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: '#fff',
                borderRadius: 2.5,
                p: 1,
                display: 'flex',
              }}
            >
              <LogoIcon />
            </Box>
            <Typography variant="h4">KS Tech</Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to the repair desk
            </Typography>
          </Stack>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              {login.isError && (
                <Alert severity="error">
                  {apiErrorMessage(login.error, 'Login failed. Try again.')}
                </Alert>
              )}
              <TextField
                label="Username"
                autoComplete="username"
                autoFocus
                fullWidth
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
              />
              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                fullWidth
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Button type="submit" variant="contained" size="large" disabled={login.isPending}>
                {login.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
