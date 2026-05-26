import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Button,
  Skeleton,
  Stack,
} from '@mui/material'
import { Visibility as ViewIcon, Edit as EditIcon } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { RecentOrder, ServiceOrderStatus, ServiceOrderPriority } from '../../types'

interface RecentOrdersProps {
  orders?: RecentOrder[]
  isLoading?: boolean
}

const getStatusColor = (
  status: ServiceOrderStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in-progress':
      return 'info'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

const getPriorityColor = (
  priority: ServiceOrderPriority
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (priority) {
    case 'urgent':
      return 'error'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    case 'low':
      return 'success'
    default:
      return 'default'
  }
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, isLoading }) => {
  return (
    <Card>
      <CardHeader title="Recent Service Orders" />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={100} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={100} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={100} />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.priority}
                        color={getPriorityColor(order.priority)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          component={Link}
                          to={`/service-orders/${order.id}`}
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon sx={{ fontSize: 16 }} />}
                        >
                          View
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#999' }}>
                    No recent orders
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
