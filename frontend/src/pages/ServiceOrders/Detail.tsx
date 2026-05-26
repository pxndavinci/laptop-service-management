import React from 'react'
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Stack,
} from '@mui/material'
import BackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useServiceOrder } from '../../lib/hooks/useServiceOrders'
import { useCustomer } from '../../lib/hooks/useCustomers'
import { useProduct } from '../../lib/hooks/useProducts'
import { ServiceOrderStatus, ServiceOrderPriority } from '../../types'

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

const ServiceOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useServiceOrder(id || '')
  const { data: customer, isLoading: customerLoading } = useCustomer(order?.customerId || '')
  const { data: product, isLoading: productLoading } = useProduct(order?.productId || '')

  if (!id) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error">Service order not found</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/')}
            variant="text"
          >
            Dashboard
          </Button>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            {isLoading ? <Skeleton width={300} /> : order?.orderNumber}
          </Typography>
        </Box>

        {/* Details */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Order Information
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`/service-orders/${id}`}
                  >
                    Edit
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Customer
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {isLoading || customerLoading ? <Skeleton /> : customer?.name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Mobile Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {isLoading || customerLoading ? <Skeleton /> : customer?.phone}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, mt: 2 }}>
                      Service
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {isLoading || productLoading ? <Skeleton /> : product?.name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {isLoading ? <Skeleton /> : order?.description}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Status
                    </Typography>
                    {isLoading ? (
                      <Skeleton width={100} />
                    ) : (
                      <Chip
                        label={order?.status}
                        color={getStatusColor(order?.status as ServiceOrderStatus)}
                        variant="outlined"
                      />
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Priority
                    </Typography>
                    {isLoading ? (
                      <Skeleton width={100} />
                    ) : (
                      <Chip
                        label={order?.priority}
                        color={getPriorityColor(order?.priority as ServiceOrderPriority)}
                        variant="filled"
                      />
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Total Cost
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {isLoading ? <Skeleton /> : `$${order?.totalCost.toLocaleString()}`}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Est. Completion
                    </Typography>
                    <Typography variant="body1">
                      {isLoading ? <Skeleton /> : new Date(order?.estimatedCompletionDate || '').toLocaleDateString()}
                    </Typography>
                  </Grid>
                  {order?.actualCompletionDate && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        Actual Completion
                      </Typography>
                      <Typography variant="body1">
                        {new Date(order.actualCompletionDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Status Timeline
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Changed By</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : order?.statusTimeline && order.statusTimeline.length > 0 ? (
                        order.statusTimeline.map((timeline, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Chip
                                label={timeline.status}
                                color={getStatusColor(timeline.status as ServiceOrderStatus)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{timeline.changedBy}</TableCell>
                            <TableCell>{new Date(timeline.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 2, color: '#999' }}>
                            No timeline data
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', whiteSpace: 'pre-wrap' }}>
                  {isLoading ? <Skeleton /> : order?.notes || 'No notes'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default ServiceOrderDetail
