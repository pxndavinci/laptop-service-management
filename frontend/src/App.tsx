import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box, CircularProgress } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './lib/theme'
import { Layout } from './components/Layout'
import NotificationsContainer from './components/NotificationsContainer'
import { RequireAuth } from './lib/auth/RequireAuth'
import { apiErrorStatus } from './lib/api/errors'

const Login = lazy(() => import('./pages/Login/Login'))
const ServiceOrdersList = lazy(() => import('./pages/ServiceOrders/List'))
const ServiceOrderDetail = lazy(() => import('./pages/ServiceOrders/Detail'))
const CreateServiceOrder = lazy(() => import('./pages/ServiceOrders/Create'))
const CustomersList = lazy(() => import('./pages/Customers/List'))
const CustomerDetail = lazy(() => import('./pages/Customers/Detail'))
const ProductsList = lazy(() => import('./pages/Products/List'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retrying a 4xx (not found, logged out) only delays the same answer
      retry: (failureCount, error) => {
        const status = apiErrorStatus(error)
        return !(status && status >= 400 && status < 500) && failureCount < 1
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
})

const PageFallback = () => (
  <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
    <CircularProgress size={32} />
  </Box>
)

const AppShell = () => (
  <Layout>
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  </Layout>
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Login />
                </Suspense>
              }
            />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/service-orders" replace />} />
                <Route path="/service-orders" element={<ServiceOrdersList />} />
                <Route path="/service-orders/new" element={<CreateServiceOrder />} />
                <Route path="/service-orders/:id" element={<ServiceOrderDetail />} />
                <Route path="/customers" element={<CustomersList />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
                <Route path="/products" element={<ProductsList />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        <NotificationsContainer />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
