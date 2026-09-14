import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  deleteServiceOrdersServiceOrderId,
  useGetServiceOrders,
} from '../../api/service-orders/service-orders'
import { useGetReferencesStatuses } from '../../api/reference-data/reference-data'
import type { GetServiceOrdersIssueDescription } from '../../api/model'
import { useUIStore } from '../../store/uiStore'
import { useDebounce } from '../../lib/hooks/useDebounce'
import { humanize } from '../../lib/format'
import { sortStatuses } from '../../lib/statuses'
import { ServiceOrdersTable } from '../../components/ServiceOrdersTable'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { invalidateOrderQueries } from '../../lib/queries'

const ServiceOrdersList = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [tagSearch, setTagSearch] = useState('')
  const [status, setStatus] = useState('')
  const [issueType, setIssueType] = useState<GetServiceOrdersIssueDescription | ''>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const debouncedTag = useDebounce(tagSearch, 300)

  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)
  const { data: statuses = [] } = useGetReferencesStatuses()

  const { data, isLoading } = useGetServiceOrders({
    tagSearch: debouncedTag || undefined,
    status: status || undefined,
    issueDescription: issueType || undefined,
    page,
    limit,
  })

  const orders = data?.data ?? []
  const total = data?.total ?? 0
  const selectedOrders = orders.filter((order) => selected.has(order.serviceOrderId ?? ''))

  // Selection is per page: changing page or filters clears it
  const resetPaging = () => {
    setPage(1)
    setSelected(new Set())
  }

  const deleteSelected = async () => {
    const ids = [...selected]
    setDeleting(true)
    const results = await Promise.allSettled(
      ids.map((serviceOrderId) => deleteServiceOrdersServiceOrderId(serviceOrderId)),
    )
    setDeleting(false)
    setConfirmOpen(false)
    setSelected(new Set())
    await invalidateOrderQueries(queryClient)

    const failed = results.filter((result) => result.status === 'rejected').length
    if (failed === 0) {
      addNotification(`Deleted ${ids.length} order${ids.length === 1 ? '' : 's'}`, 'success')
    } else {
      addNotification(`Deleted ${ids.length - failed} of ${ids.length}; ${failed} failed`, 'error')
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3, pb: selected.size > 0 ? 12 : 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}
        >
          <Typography variant="h2">Service Orders</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/service-orders/new"
          >
            New Order
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Tag #"
                placeholder="e.g. 0004"
                size="small"
                value={tagSearch}
                onChange={(e) => {
                  setTagSearch(e.target.value.replace(/\D/g, '').slice(0, 6))
                  resetPaging()
                }}
                slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                sx={{ minWidth: 140 }}
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={status}
                  label="Status"
                  onChange={(e) => {
                    setStatus(e.target.value)
                    resetPaging()
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {sortStatuses(statuses).map((option) => (
                    <MenuItem key={option.statusId} value={option.statusName}>
                      {humanize(option.statusName)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="issue-filter-label">Issue type</InputLabel>
                <Select
                  labelId="issue-filter-label"
                  value={issueType}
                  label="Issue type"
                  onChange={(e) => {
                    setIssueType(e.target.value as GetServiceOrdersIssueDescription | '')
                    resetPaging()
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
            <ServiceOrdersTable
              orders={orders}
              isLoading={isLoading}
              selection={{ selected, onChange: setSelected }}
            />
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={limit}
              page={page - 1}
              onPageChange={(_, newPage) => {
                setPage(newPage + 1)
                setSelected(new Set())
              }}
              onRowsPerPageChange={(event) => {
                setLimit(parseInt(event.target.value, 10))
                resetPaging()
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {selected.size > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          <Typography>{selected.size} selected</Typography>
          <Button onClick={() => setSelected(new Set())}>Clear</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setConfirmOpen(true)}
          >
            Delete selected ({selected.size})
          </Button>
        </Paper>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selected.size} service order${selected.size === 1 ? '' : 's'}?`}
        confirmLabel="Delete"
        destructive
        isLoading={deleting}
        onConfirm={deleteSelected}
        onClose={() => setConfirmOpen(false)}
      >
        <Typography>
          Tag {selectedOrders.map((order) => `#${order.tagNo}`).join(', ')} and their status history
          will be permanently removed.
        </Typography>
      </ConfirmDialog>
    </Container>
  )
}

export default ServiceOrdersList
