import React from 'react'
import { Box, Card, CardContent, CardHeader, Chip, Skeleton, Stack, Typography } from '@mui/material'
import { TrendDataPoint } from '../../types'

interface ServiceTrendChartProps {
  data?: TrendDataPoint[]
  isLoading?: boolean
}

export const ServiceTrendChart: React.FC<ServiceTrendChartProps> = ({ data = [], isLoading }) => {
  const maxOrders = Math.max(
    1,
    ...data.map((day) => day.completed + day.pending + day.cancelled)
  )

  return (
    <Card sx={{ mb: 4 }}>
      <CardHeader
        title="Service Order Trends"
        subheader="Daily repair workload at a glance"
        action={
          <Stack direction="row" spacing={1} sx={{ mr: 1, mt: 0.5 }}>
            <Chip size="small" label="Completed" color="success" variant="outlined" />
            <Chip size="small" label="Pending" color="warning" variant="outlined" />
          </Stack>
        }
      />
      <CardContent>
        {isLoading ? (
          <Stack spacing={2}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={34} />
            ))}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {data.map((day) => (
              <Box
                key={day.date}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '82px 1fr', sm: '105px 1fr 65px' },
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Typography>
                <Box sx={{ display: 'flex', height: 12, overflow: 'hidden', borderRadius: 8, bgcolor: '#EEF1EE' }}>
                  <Box sx={{ width: `${(day.completed / maxOrders) * 100}%`, bgcolor: 'success.main' }} />
                  <Box sx={{ width: `${(day.pending / maxOrders) * 100}%`, bgcolor: 'warning.main' }} />
                  <Box sx={{ width: `${(day.cancelled / maxOrders) * 100}%`, bgcolor: 'error.main' }} />
                </Box>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, textAlign: 'right' }}>
                  {day.completed + day.pending + day.cancelled}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
