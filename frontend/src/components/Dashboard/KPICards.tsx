import React from 'react'
import { Box, Card, CardContent, Typography, Grid, Skeleton } from '@mui/material'
import OrderIcon from '@mui/icons-material/AssignmentTurnedIn'
import CompletedIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Schedule'
import RevenueIcon from '@mui/icons-material/AttachMoney'
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
  <Card sx={{ height: '100%', overflow: 'hidden' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton width={100} height={40} />
          ) : (
            <Typography variant="h4" sx={{ color }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${color}12`,
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
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KPICard
          title="Total Orders"
          value={metrics?.totalOrders ?? 0}
          icon={<OrderIcon sx={{ fontSize: 28 }} />}
          color="#1976D2"
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KPICard
          title="Completed"
          value={metrics?.completedOrders ?? 0}
          icon={<CompletedIcon sx={{ fontSize: 28 }} />}
          color="#4CAF50"
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KPICard
          title="Pending"
          value={metrics?.pendingOrders ?? 0}
          icon={<PendingIcon sx={{ fontSize: 28 }} />}
          color="#FF9800"
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
