import React from 'react'
import { Box, Card, CardContent, Typography, Grid, Skeleton } from '@mui/material'
import {
  AssignmentTurnedIn as OrderIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  AttachMoney as RevenueIcon,
} from '@mui/icons-material'
import { DashboardMetrics } from '../../types'

interface KPICardsProps {
  metrics?: DashboardMetrics
  isLoading?: boolean
}

const KPICard: React.FC<{
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  isLoading?: boolean
}> = ({ title, value, icon, color, isLoading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton width={100} height={40} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ color, fontSize: 28, display: 'flex' }}>
            {icon}
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export const KPICards: React.FC<KPICardsProps> = ({ metrics, isLoading }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Total Orders"
          value={metrics?.totalOrders ?? 0}
          icon={<OrderIcon sx={{ fontSize: 28 }} />}
          color="#1976D2"
          isLoading={isLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Completed"
          value={metrics?.completedOrders ?? 0}
          icon={<CompletedIcon sx={{ fontSize: 28 }} />}
          color="#4CAF50"
          isLoading={isLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Pending"
          value={metrics?.pendingOrders ?? 0}
          icon={<PendingIcon sx={{ fontSize: 28 }} />}
          color="#FF9800"
          isLoading={isLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Total Revenue"
          value={`$${(metrics?.totalRevenue ?? 0).toLocaleString()}`}
          icon={<RevenueIcon sx={{ fontSize: 28 }} />}
          color="#9C27B0"
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  )
}
