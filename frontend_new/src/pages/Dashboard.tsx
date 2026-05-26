import React from 'react'
import { Container, Box, Typography } from '@mui/material'
import { KPICards } from '../components/Dashboard/KPICards'
import { ServiceTrendChart } from '../components/Dashboard/ServiceTrendChart'
import { RecentOrders } from '../components/Dashboard/RecentOrders'
import { DateRangeFilter } from '../components/Dashboard/DateRangeFilter'
import { useDashboardMetrics, useTrendData, useRecentOrders } from '../lib/hooks/useDashboardData'

const Dashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics()
  const { data: trendData, isLoading: trendLoading } = useTrendData()
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders()

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Welcome to the Service Management System. Here's an overview of your service operations.
          </Typography>
        </Box>

        {/* Date Range Filter */}
        <DateRangeFilter />

        {/* KPI Cards */}
        <KPICards metrics={metrics} isLoading={metricsLoading} />

        {/* Trend Chart */}
        <ServiceTrendChart data={trendData} isLoading={trendLoading} />

        {/* Recent Orders */}
        <RecentOrders orders={recentOrders} isLoading={ordersLoading} />
      </Box>
    </Container>
  )
}

export default Dashboard
