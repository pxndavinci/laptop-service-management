import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import { useGetUsers } from '../../api/users/users'
import type { Users } from '../../api/model'
import { useDebounce } from '../../lib/hooks/useDebounce'
import { formatDate } from '../../lib/format'
import { CUSTOMER_ROLE_ID } from '../../lib/config'
import { CustomerFormDialog } from '../../components/CustomerFormDialog'
import { DeleteCustomerDialog } from '../../components/DeleteCustomerDialog'

const COLUMNS = 6

const CustomersList = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Users | null>(null)
  const debouncedSearch = useDebounce(search, 350)

  const { data, isLoading } = useGetUsers({
    userName: debouncedSearch.trim() || undefined,
    roleId: CUSTOMER_ROLE_ID,
    page,
    limit,
  })

  const users = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}
        >
          <Typography variant="h2">Customers</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
            New customer
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              placeholder="Search by name…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { 'aria-label': 'Search customers by name' } }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Registered</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={COLUMNS} align="center" sx={{ py: 4 }}>
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={COLUMNS}
                        align="center"
                        sx={{ py: 4, color: 'text.secondary' }}
                      >
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.userId}
                        hover
                        onClick={() => navigate(`/customers/${user.userId}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{user.userName}</TableCell>
                        <TableCell>{user.contactNumber ?? '—'}</TableCell>
                        <TableCell>{user.email ?? '—'}</TableCell>
                        <TableCell>{user.address ?? '—'}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                          <Tooltip title="Delete customer">
                            <IconButton
                              size="small"
                              aria-label={`Delete ${user.userName}`}
                              onClick={() => setPendingDelete(user)}
                            >
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>
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

      <CustomerFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(userId) => navigate(`/customers/${userId}`)}
      />
      <DeleteCustomerDialog customer={pendingDelete} onClose={() => setPendingDelete(null)} />
    </Container>
  )
}

export default CustomersList
