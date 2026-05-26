import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { DashboardMetrics, TrendDataPoint } from '../../types'

// Mock data for fallback when API is unavailable
const mockMetrics: DashboardMetrics = {
  totalOrders: 156,
  completedOrders: 98,
  pendingOrders: 42,
  totalRevenue: 24580,
}

const mockTrendData: TrendDataPoint[] = [
  { date: '2026-05-18', completed: 8, pending: 5, cancelled: 1 },
  { date: '2026-05-19', completed: 12, pending: 8, cancelled: 2 },
  { date: '2026-05-20', completed: 10, pending: 6, cancelled: 0 },
  { date: '2026-05-21', completed: 15, pending: 9, cancelled: 1 },
  { date: '2026-05-22', completed: 11, pending: 7, cancelled: 2 },
  { date: '2026-05-23', completed: 14, pending: 10, cancelled: 1 },
  { date: '2026-05-24', completed: 16, pending: 8, cancelled: 0 },
]

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      try {
        const response = await client.get<DashboardMetrics>(ENDPOINTS.dashboard.metrics)
        return response.data
      } catch (error) {
        console.log('[v0] Using mock dashboard metrics due to API unavailability')
        return mockMetrics
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useTrendData = () => {
  return useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: async () => {
      try {
        const response = await client.get<TrendDataPoint[]>(ENDPOINTS.dashboard.trendData)
        return response.data
      } catch (error) {
        console.log('[v0] Using mock trend data due to API unavailability')
        return mockTrendData
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}
