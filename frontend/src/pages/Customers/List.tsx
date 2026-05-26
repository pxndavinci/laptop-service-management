import React from 'react'
import {
  Box,
  Typography,
  Container,
  Button,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  TablePagination,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ViewIcon from '@mui/icons-material/Visibility'
import { useCustomers, useDeleteCustomer } from '../../lib/hooks/useCustomers'
import { useFilterStore } from '../../store/filterStore'

const CustomersList: React.FC = () => {
  const filterStore = useFilterStore()
  const deleteCustomerMutation = useDeleteCustomer()

  const { data, isLoading } = useCustomers({
    page: filterStore.customerPage,
    limit: filterStore.customerLimit,
    search: filterStore.customerSearch,
  })

  const handleSearchChange = (value: string) => {
    filterStore.setCustomerSearch(value)
  }

  const handlePageChange = (_: unknown, newPage: number) => {
    filterStore.setCustomerPage(newPage + 1)
  }

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomerMutation.mutateAsync(id)
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            Customers
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Customer
          </Button>
        </Box>

        {/* Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              placeholder="Search by name, email, or phone..."
              value={filterStore.customerSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              fullWidth
              size="small"
            />
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
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
                        </TableRow>
                      ))
                    : data?.data && data.data.length > 0
                    ? data.data.map((customer) => (
                        <TableRow key={customer.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.city}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                              <IconButton size="small" title="View">
                                <ViewIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton size="small" title="Edit">
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteCustomer(customer.id)}
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
                          <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#999' }}>
                            No customers found
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
                rowsPerPage={filterStore.customerLimit}
                page={filterStore.customerPage - 1}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default CustomersList
