import React from 'react'
import { Container, Box, Typography } from '@mui/material'
import { KPICards } from '../components/Dashboard/KPICards'
import { ServiceTrendChart } from '../components/Dashboard/ServiceTrendChart'
import { DateRangeFilter } from '../components/Dashboard/DateRangeFilter'
import { useDashboardMetrics, useTrendData } from '../lib/hooks/useDashboardData'
import ServiceOrdersList from './ServiceOrders/List'

const Dashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics()
  const { data: trendData, isLoading: trendLoading } = useTrendData()

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 1, md: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            A quick view of repairs, collections and daily workload.
          </Typography>
        </Box>

        {/* Date Range Filter */}
        <DateRangeFilter />

        {/* KPI Cards */}
        <KPICards metrics={metrics} isLoading={metricsLoading} />

        {/* Trend Chart */}
        <ServiceTrendChart data={trendData} isLoading={trendLoading} />

        {/* Searchable order register */}
        <ServiceOrdersList embedded />
      </Box>
    </Container>
  )
}

export default Dashboard
