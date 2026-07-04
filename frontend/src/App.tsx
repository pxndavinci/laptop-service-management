import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box, CircularProgress } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './lib/theme'
import { Layout } from './components/Layout'
import NotificationsContainer from './components/NotificationsContainer'

const ServiceOrdersList = lazy(() => import('./pages/ServiceOrders/List'))
const ServiceOrderDetail = lazy(() => import('./pages/ServiceOrders/Detail'))
const CreateServiceOrder = lazy(() => import('./pages/ServiceOrders/Create'))
const CustomersList = lazy(() => import('./pages/Customers/List'))
const ProductsList = lazy(() => import('./pages/Products/List'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Suspense
              fallback={
                <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
                  <CircularProgress size={32} />
                </Box>
              }
            >
              <Routes>
                <Route path="/" element={<Navigate to="/service-orders" replace />} />
                <Route path="/service-orders" element={<ServiceOrdersList />} />
                <Route path="/service-orders/new" element={<CreateServiceOrder />} />
                <Route path="/service-orders/:id" element={<ServiceOrderDetail />} />
                <Route path="/customers" element={<CustomersList />} />
                <Route path="/products" element={<ProductsList />} />
                <Route path="*" element={<Navigate to="/service-orders" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
        <NotificationsContainer />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
