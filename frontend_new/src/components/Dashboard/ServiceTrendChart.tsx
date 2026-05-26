import React from 'react'
import { Card, CardContent, CardHeader, Skeleton, Box } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendDataPoint } from '../../types'

interface ServiceTrendChartProps {
  data?: TrendDataPoint[]
  isLoading?: boolean
}

export const ServiceTrendChart: React.FC<ServiceTrendChartProps> = ({ data, isLoading }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardHeader title="Service Order Trends" />
      <CardContent>
        {isLoading ? (
          <Box sx={{ height: 300 }}>
            <Skeleton variant="rectangular" height="100%" />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={{ fill: '#4CAF50' }}
                name="Completed"
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#FF9800"
                strokeWidth={2}
                dot={{ fill: '#FF9800' }}
                name="Pending"
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                stroke="#F44336"
                strokeWidth={2}
                dot={{ fill: '#F44336' }}
                name="Cancelled"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
