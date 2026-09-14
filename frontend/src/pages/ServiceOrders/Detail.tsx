import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import UpdateIcon from '@mui/icons-material/Update'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useGetServiceOrdersServiceOrderId } from '../../api/service-orders/service-orders'
import {
  useDeleteServiceStatusServiceStatusId,
  useGetServiceStatus,
} from '../../api/service-status/service-status'
import type { ServiceStatuses } from '../../api/model'
import { formatDateTime, formatPrice, humanize } from '../../lib/format'
import { apiErrorMessage } from '../../lib/api/errors'
import { invalidateOrderQueries } from '../../lib/queries'
import { useUIStore } from '../../store/uiStore'
import { StatusChip } from '../../components/StatusChip'
import { StatusDialog } from '../../components/StatusDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { OrderDetailsEditor } from '../../components/OrderDetailsForm'

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" component="div">
      {value ?? '—'}
    </Typography>
  </Box>
)

const ServiceOrderDetail = () => {
  const { id = '' } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)

  const [editingDetails, setEditingDetails] = useState(false)
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean
    entry: ServiceStatuses | null
  }>({ open: false, entry: null })
  const [menu, setMenu] = useState<{ anchor: HTMLElement; entry: ServiceStatuses } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ServiceStatuses | null>(null)

  const {
    data: order,
    isLoading,
    isError,
  } = useGetServiceOrdersServiceOrderId(id, {
    query: { enabled: !!id },
  })
  const { data: statusHistory } = useGetServiceStatus(
    { serviceOrderId: id, limit: 100 },
    { query: { enabled: !!id } },
  )
  const deleteStatus = useDeleteServiceStatusServiceStatusId()

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

  const confirmDeleteStatus = async () => {
    if (!pendingDelete?.serviceStatusId) return
    try {
      await deleteStatus.mutateAsync({ serviceStatusId: pendingDelete.serviceStatusId })
      await invalidateOrderQueries(queryClient)
      addNotification('Status entry deleted', 'success')
    } catch (error) {
      addNotification(apiErrorMessage(error, 'Could not delete the status entry'), 'error')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', mb: 3, flexWrap: 'wrap', rowGap: 1 }}
        >
          <Button component={Link} to="/service-orders" startIcon={<ArrowBackIcon />}>
            Back
          </Button>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            Order #{order.tagNo}
          </Typography>
          <StatusChip status={order.currentStatus} size="medium" />
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
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Order details</Typography>
              {!editingDetails && (
                <Button startIcon={<EditIcon />} onClick={() => setEditingDetails(true)}>
                  Edit
                </Button>
              )}
            </Stack>
            {editingDetails ? (
              <OrderDetailsEditor order={order} onDone={() => setEditingDetails(false)} />
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field label="Issue type" value={humanize(order.issueDescription)} />
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
                  <Field label="Payment status" value={humanize(order.paymentStatus)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field label="Payment method" value={humanize(order.paymentMethod)} />
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Status history</Typography>
              <Button
                variant="contained"
                startIcon={<UpdateIcon />}
                onClick={() => setStatusDialog({ open: true, entry: null })}
              >
                Update status
              </Button>
            </Stack>
            {statuses.length === 0 ? (
              <Typography color="text.secondary">
                No status updates yet — the order counts as Received.
              </Typography>
            ) : (
              <Stack divider={<Divider />} spacing={2}>
                {statuses.map((status) => (
                  <Stack
                    key={status.serviceStatusId}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'flex-start' }}
                    data-testid="status-entry"
                  >
                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                      >
                        <StatusChip status={status.statusName} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(status.createdAt)} · {status.assignedToName}
                          {status.notifyCustomer ? ' · customer notified' : ''}
                        </Typography>
                      </Stack>
                      {status.comment && (
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                          {status.comment}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      aria-label="Status entry actions"
                      onClick={(event) => setMenu({ anchor: event.currentTarget, entry: status })}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
        <MenuItem
          onClick={() => {
            setStatusDialog({ open: true, entry: menu!.entry })
            setMenu(null)
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPendingDelete(menu!.entry)
            setMenu(null)
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <StatusDialog
        open={statusDialog.open}
        entry={statusDialog.entry}
        serviceOrderId={order.serviceOrderId!}
        onClose={() => setStatusDialog({ open: false, entry: null })}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete status entry?"
        confirmLabel="Delete"
        destructive
        isLoading={deleteStatus.isPending}
        onConfirm={confirmDeleteStatus}
        onClose={() => setPendingDelete(null)}
      >
        <Typography>
          The “{humanize(pendingDelete?.statusName)}” entry from{' '}
          {formatDateTime(pendingDelete?.createdAt)} will be removed. If it is the latest entry, the
          order’s current status changes to the previous one.
        </Typography>
      </ConfirmDialog>
    </Container>
  )
}

export default ServiceOrderDetail
