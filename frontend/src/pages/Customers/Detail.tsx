import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PhoneIcon from '@mui/icons-material/Phone'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGetUsersUserId } from '../../api/users/users'
import { useGetContacts } from '../../api/contacts/contacts'
import { useGetUserProducts } from '../../api/products/products'
import { useGetServiceOrders } from '../../api/service-orders/service-orders'
import { formatDate } from '../../lib/format'
import { ServiceOrdersTable } from '../../components/ServiceOrdersTable'
import { CustomerFormDialog } from '../../components/CustomerFormDialog'
import { DeleteCustomerDialog } from '../../components/DeleteCustomerDialog'

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
      {value || '—'}
    </Typography>
  </Box>
)

const CustomerDetail = () => {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [orderPage, setOrderPage] = useState(1)
  const orderLimit = 10

  const {
    data: customer,
    isLoading,
    isError,
  } = useGetUsersUserId(id, {
    query: { enabled: !!id },
  })
  const { data: contactData } = useGetContacts(
    { userId: id, limit: 100 },
    { query: { enabled: !!id } },
  )
  const { data: deviceData } = useGetUserProducts(
    { userId: id, limit: 100 },
    { query: { enabled: !!id } },
  )
  const { data: orderData, isLoading: ordersLoading } = useGetServiceOrders(
    { userId: id, page: orderPage, limit: orderLimit },
    { query: { enabled: !!id } },
  )

  if (isLoading) {
    return (
      <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (isError || !customer) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Customer not found
          </Typography>
          <Button component={Link} to="/customers" startIcon={<ArrowBackIcon />}>
            Back to customers
          </Button>
        </Box>
      </Container>
    )
  }

  // Oldest first, so the primary number (shown in lists) comes first
  const contacts = [...(contactData?.data ?? [])].reverse()
  const devices = deviceData?.data ?? []

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', mb: 3, flexWrap: 'wrap', rowGap: 1 }}
        >
          <Button component={Link} to="/customers" startIcon={<ArrowBackIcon />}>
            Back
          </Button>
          <Typography variant="h2" sx={{ flex: 1 }}>
            {customer.userName}
          </Typography>
          <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button startIcon={<DeleteIcon />} color="error" onClick={() => setDeleting(true)}>
            Delete
          </Button>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Details
                </Typography>
                <Stack spacing={2}>
                  <Field label="Email" value={customer.email} />
                  <Field label="Address" value={customer.address} />
                  <Field label="Customer since" value={formatDate(customer.createdAt)} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Contact numbers
                </Typography>
                {contacts.length === 0 ? (
                  <Typography color="text.secondary">No contact numbers.</Typography>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                    {contacts.map((contact) => (
                      <Chip
                        key={contact.contactId}
                        icon={<PhoneIcon />}
                        label={contact.contactNumber}
                        component="a"
                        href={`tel:${contact.contactNumber}`}
                        clickable
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Devices
            </Typography>
            {devices.length === 0 ? (
              <Typography color="text.secondary">No registered devices.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Device</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Serial number</TableCell>
                      <TableCell>Login password</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device.userProductId}>
                        <TableCell>
                          {[device.brandName, device.productName].filter(Boolean).join(' ')}
                        </TableCell>
                        <TableCell>{device.productTypeName}</TableCell>
                        <TableCell>{device.serialNumber}</TableCell>
                        <TableCell>{device.loginPassword || '—'}</TableCell>
                        <TableCell>{device.additionalInfo || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Service orders
            </Typography>
            <ServiceOrdersTable
              orders={orderData?.data ?? []}
              isLoading={ordersLoading}
              columns={['tag', 'device', 'issue', 'status', 'estimatedPrice', 'created']}
              emptyText="No service orders for this customer yet"
            />
            {(orderData?.total ?? 0) > orderLimit && (
              <TablePagination
                component="div"
                count={orderData?.total ?? 0}
                rowsPerPage={orderLimit}
                rowsPerPageOptions={[orderLimit]}
                page={orderPage - 1}
                onPageChange={(_, newPage) => setOrderPage(newPage + 1)}
              />
            )}
          </CardContent>
        </Card>
      </Box>

      <CustomerFormDialog
        open={editing}
        customer={customer}
        contacts={contacts}
        onClose={() => setEditing(false)}
      />
      <DeleteCustomerDialog
        customer={deleting ? customer : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => navigate('/customers', { replace: true })}
      />
    </Container>
  )
}

export default CustomerDetail
