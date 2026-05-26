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
  Chip,
  Stack,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ViewIcon from '@mui/icons-material/Visibility'
import { useProducts, useDeleteProduct } from '../../lib/hooks/useProducts'
import { useFilterStore } from '../../store/filterStore'

const ProductsList: React.FC = () => {
  const filterStore = useFilterStore()
  const deleteProductMutation = useDeleteProduct()

  const { data, isLoading } = useProducts({
    page: filterStore.productPage,
    limit: filterStore.productLimit,
    search: filterStore.productSearch,
    category: filterStore.productCategory,
  })

  const handleSearchChange = (value: string) => {
    filterStore.setProductSearch(value)
  }

  const handleCategoryChange = (value: string) => {
    filterStore.setProductCategory(value === '' ? undefined : value)
  }

  const handlePageChange = (_: unknown, newPage: number) => {
    filterStore.setProductPage(newPage + 1)
  }

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProductMutation.mutateAsync(id)
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            Products
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Product
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                placeholder="Search by name or description..."
                value={filterStore.productSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                fullWidth
                size="small"
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterStore.productCategory || ''}
                  label="Category"
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Display">Display</MenuItem>
                  <MenuItem value="Power">Power</MenuItem>
                  <MenuItem value="Memory">Memory</MenuItem>
                  <MenuItem value="Storage">Storage</MenuItem>
                  <MenuItem value="Repair">Repair</MenuItem>
                </Select>
              </FormControl>
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
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
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
                        </TableRow>
                      ))
                    : data?.data && data.data.length > 0
                    ? data.data.map((product) => (
                        <TableRow key={product.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>${product.unitPrice.toLocaleString()}</TableCell>
                          <TableCell>{product.description?.substring(0, 40)}...</TableCell>
                          <TableCell>
                            <Chip
                              label={product.inStock ? 'In Stock' : 'Out of Stock'}
                              color={product.inStock ? 'success' : 'error'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
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
                                onClick={() => handleDeleteProduct(product.id)}
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
                          <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#999' }}>
                            No products found
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
                rowsPerPage={filterStore.productLimit}
                page={filterStore.productPage - 1}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default ProductsList
