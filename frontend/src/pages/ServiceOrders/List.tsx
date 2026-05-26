import React from 'react'
import {
  Box,
  Typography,
  Container,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TablePagination,
  Card,
  CardContent,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ViewIcon from '@mui/icons-material/Visibility'
import { Link } from 'react-router-dom'
import { useServiceOrders, useDeleteServiceOrder } from '../../lib/hooks/useServiceOrders'
import { useFilterStore } from '../../store/filterStore'
import { ServiceOrderStatus, ServiceOrderPriority } from '../../types'
import { useCustomers } from '../../lib/hooks/useCustomers'
import { useProducts } from '../../lib/hooks/useProducts'

interface ServiceOrdersListProps {
  embedded?: boolean
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

const ServiceOrdersList: React.FC<ServiceOrdersListProps> = ({ embedded = false }) => {
  const filterStore = useFilterStore()
  const deleteOrderMutation = useDeleteServiceOrder()
  const { data: customers } = useCustomers({ limit: 100 })
  const { data: products } = useProducts({ limit: 100 })

  const { data, isLoading } = useServiceOrders({
    page: filterStore.serviceOrderPage,
    limit: filterStore.serviceOrderLimit,
    status: filterStore.serviceOrderStatus,
    priority: filterStore.serviceOrderPriority,
    search: filterStore.serviceOrderSearch,
    sortBy: filterStore.serviceOrderSortBy,
    sortOrder: filterStore.serviceOrderSortOrder,
  })

  const handleSearchChange = (value: string) => {
    filterStore.setServiceOrderSearch(value)
  }

  const handleStatusChange = (value: ServiceOrderStatus | '') => {
    filterStore.setServiceOrderStatus(value === '' ? undefined : (value as ServiceOrderStatus))
  }

  const handlePriorityChange = (value: ServiceOrderPriority | '') => {
    filterStore.setServiceOrderPriority(value === '' ? undefined : (value as ServiceOrderPriority))
  }

  const handlePageChange = (_: unknown, newPage: number) => {
    filterStore.setServiceOrderPage(newPage + 1)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    filterStore.setServiceOrderPage(1)
    // Update limit (note: filterStore doesn't have method for this in current design)
  }

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service order?')) {
      await deleteOrderMutation.mutateAsync(id)
    }
  }

  const customerName = (id: string) =>
    customers?.data.find((customer) => customer.id === id)?.name || 'Customer unavailable'

  const productName = (id: string) =>
    products?.data.find((product) => product.id === id)?.name || 'Service unavailable'

  return (
    <Container maxWidth="lg" disableGutters={embedded}>
      <Box sx={{ py: embedded ? 1 : 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant={embedded ? 'h3' : 'h2'}>
            {embedded ? 'Service Orders' : 'Service Orders Register'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/service-orders"
          >
            New Order
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                placeholder="Search by order number or customer..."
                value={filterStore.serviceOrderSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                fullWidth
                size="small"
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStore.serviceOrderStatus || ''}
                    label="Status"
                    onChange={(e) => handleStatusChange(e.target.value as ServiceOrderStatus | '')}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterStore.serviceOrderPriority || ''}
                    label="Priority"
                    onChange={(e) => handlePriorityChange(e.target.value as ServiceOrderPriority | '')}
                  >
                    <MenuItem value="">All Priorities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Cost
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      ))
                    : data?.data && data.data.length > 0
                    ? data.data.map((order) => (
                        <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{order.orderNumber}</TableCell>
                          <TableCell>{customerName(order.customerId)}</TableCell>
                          <TableCell>{productName(order.productId)}</TableCell>
                          <TableCell>{order.description.substring(0, 40)}...</TableCell>
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
                          <TableCell align="right">${order.totalCost.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                component={Link}
                                to={`/service-orders/${order.id}`}
                                title="View"
                              >
                                <ViewIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                component={Link}
                                to={`/service-orders/${order.id}`}
                                title="Edit"
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteOrder(order.id)}
                                title="Delete"
                              >
                                <DeleteIcon sx={{ fontSize: 18, color: '#F44336' }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    : (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#999' }}>
                            No service orders found
                          </TableCell>
                        </TableRow>
                      )}
                </TableBody>
              </Table>
            </TableContainer>
            {data && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.total}
                rowsPerPage={filterStore.serviceOrderLimit}
                page={filterStore.serviceOrderPage - 1}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default ServiceOrdersList
