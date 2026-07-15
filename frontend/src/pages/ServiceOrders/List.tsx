import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  getGetServiceOrdersQueryKey,
  useDeleteServiceOrdersServiceOrderId,
  useGetServiceOrders,
} from '../../api/service-orders/service-orders'
import type {
  GetServiceOrdersIssueDescription,
  GetServiceOrdersPaymentStatus,
} from '../../api/model'
import { useUIStore } from '../../store/uiStore'

const PRIORITY_COLORS: Record<number, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
  1: 'error',
  2: 'warning',
  3: 'info',
  4: 'success',
  5: 'default',
}

const formatPrice = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : `₹${value.toLocaleString()}`

const formatDate = (value: string | undefined) =>
  value ? new Date(value).toLocaleDateString() : '—'

const ServiceOrdersList = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [tagNo, setTagNo] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<GetServiceOrdersPaymentStatus | ''>('')
  const [issueType, setIssueType] = useState<GetServiceOrdersIssueDescription | ''>('')

  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  const { data, isLoading } = useGetServiceOrders({
    tagNo: tagNo ? Number(tagNo) : undefined,
    paymentStatus: paymentStatus || undefined,
    issueDescription: issueType || undefined,
    page,
    limit,
  })

  const deleteMutation = useDeleteServiceOrdersServiceOrderId({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetServiceOrdersQueryKey() })
        addNotification('Service order deleted', 'success')
      },
      onError: () => addNotification('Failed to delete service order', 'error'),
    },
  })

  const orders = data?.data ?? []
  const total = data?.total ?? 0

  const handleDelete = (serviceOrderId: string | undefined, tag: number | undefined) => {
    if (!serviceOrderId) return
    if (window.confirm(`Delete service order #${tag ?? ''}? This cannot be undone.`)) {
      deleteMutation.mutate({ serviceOrderId })
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h2">Service Orders</Typography>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/service-orders/new">
            New Order
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Tag #"
                size="small"
                type="number"
                value={tagNo}
                onChange={(e) => {
                  setTagNo(e.target.value)
                  setPage(1)
                }}
                sx={{ minWidth: 140 }}
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Payment status</InputLabel>
                <Select
                  value={paymentStatus}
                  label="Payment status"
                  onChange={(e) => {
                    setPaymentStatus(e.target.value as GetServiceOrdersPaymentStatus | '')
                    setPage(1)
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PARTIAL">Partial</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="REFUNDED">Refunded</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Issue type</InputLabel>
                <Select
                  value={issueType}
                  label="Issue type"
                  onChange={(e) => {
                    setIssueType(e.target.value as GetServiceOrdersIssueDescription | '')
                    setPage(1)
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="HARDWARE">Hardware</MenuItem>
                  <MenuItem value="SOFTWARE">Software</MenuItem>
                  <MenuItem value="NETWORK">Network</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tag #</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Device</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Issue</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Est. price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No service orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow
                        key={order.serviceOrderId}
                        hover
                        onClick={() => navigate(`/service-orders/${order.serviceOrderId}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{order.tagNo}</TableCell>
                        <TableCell>{order.userName}</TableCell>
                        <TableCell>{order.contactNumber ?? '—'}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {[order.brandName, order.productName].filter(Boolean).join(' ')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.serialNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={order.issueDescription} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`P${order.priorityLevel}`}
                            size="small"
                            color={PRIORITY_COLORS[order.priorityLevel ?? 3] ?? 'default'}
                          />
                        </TableCell>
                        <TableCell>{order.currentStatus ?? 'Received'}</TableCell>
                        <TableCell align="right">{formatPrice(order.estimatedPrice)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(order.serviceOrderId, order.tagNo)
                              }}
                              title="Delete"
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} color="error" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={limit}
              page={page - 1}
              onPageChange={(_, newPage) => setPage(newPage + 1)}
              onRowsPerPageChange={(event) => {
                setLimit(parseInt(event.target.value, 10))
                setPage(1)
              }}
            />
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default ServiceOrdersList
