import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link, useParams } from 'react-router-dom'
import { useGetServiceOrdersServiceOrderId } from '../../api/service-orders/service-orders'
import { useGetServiceStatus } from '../../api/service-status/service-status'

const formatDateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : '—'

const formatPrice = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : `₹${value.toLocaleString()}`

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value ?? '—'}</Typography>
  </Box>
)

const ServiceOrderDetail = () => {
  const { id = '' } = useParams<{ id: string }>()

  const { data: order, isLoading, isError } = useGetServiceOrdersServiceOrderId(id, {
    query: { enabled: !!id },
  })
  const { data: statusHistory } = useGetServiceStatus(
    { serviceOrderId: id, limit: 50 },
    { query: { enabled: !!id } },
  )

  if (isLoading) {
    return (
      <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (isError || !order) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Service order not found
          </Typography>
          <Button component={Link} to="/service-orders" startIcon={<ArrowBackIcon />}>
            Back to service orders
          </Button>
        </Box>
      </Container>
    )
  }

  const statuses = statusHistory?.data ?? []

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
          <Button component={Link} to="/service-orders" startIcon={<ArrowBackIcon />}>
            Back
          </Button>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            Order #{order.tagNo}
          </Typography>
          <Chip label={order.currentStatus ?? 'Received'} color="info" />
        </Stack>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Customer & device
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Customer" value={order.userName} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Contact" value={order.contactNumber} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label="Device"
                  value={[order.brandName, order.productName].filter(Boolean).join(' ')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Serial number" value={order.serialNumber} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Issue type" value={order.issueDescription} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Priority" value={`P${order.priorityLevel}`} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Estimated price" value={formatPrice(order.estimatedPrice)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Final price" value={formatPrice(order.finalPrice)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Payment status" value={order.paymentStatus} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Payment method" value={order.paymentMethod ?? '—'} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label="Estimated completion"
                  value={formatDateTime(order.estimatedCompletionDate)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label="Actual completion"
                  value={formatDateTime(order.actualCompletionDate)}
                />
              </Grid>
              <Grid size={12}>
                <Field label="Issue notes" value={order.issueNotes || '—'} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Created" value={formatDateTime(order.createdAt)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Last updated" value={formatDateTime(order.updatedAt)} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Status history
            </Typography>
            {statuses.length === 0 ? (
              <Typography color="text.secondary">No status updates yet.</Typography>
            ) : (
              <Stack divider={<Divider />} spacing={2}>
                {statuses.map((status) => (
                  <Box key={status.serviceStatusId}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Chip label={status.statusName} size="small" color="info" />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(status.createdAt)} · {status.assignedToName}
                      </Typography>
                    </Stack>
                    {status.comment && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {status.comment}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default ServiceOrderDetail
