import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './lib/theme'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import ServiceOrdersList from './pages/ServiceOrders/List'
import ServiceOrderDetail from './pages/ServiceOrders/Detail'
import CreateServiceOrder from './pages/ServiceOrders/Create'
import CustomersList from './pages/Customers/List'
import ProductsList from './pages/Products/List'
import ReportsPage from './pages/Reports'
import NotificationsContainer from './components/NotificationsContainer'

// Create TanStack Query client
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
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/service-orders" element={<ServiceOrdersList />} />
              <Route path="/service-orders/new" element={<CreateServiceOrder />} />
              <Route path="/service-orders/:id" element={<ServiceOrderDetail />} />
              <Route path="/customers" element={<CustomersList />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
        <NotificationsContainer />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
