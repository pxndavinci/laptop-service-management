import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useQueryClient } from '@tanstack/react-query'
import { deleteProductsProductId, useGetProducts } from '../../api/products/products'
import {
  useGetReferencesBrands,
  useGetReferencesProductTypes,
} from '../../api/reference-data/reference-data'
import type { Products } from '../../api/model'
import { useDebounce } from '../../lib/hooks/useDebounce'
import { apiErrorMessage } from '../../lib/api/errors'
import { invalidateProductQueries } from '../../lib/queries'
import { useUIStore } from '../../store/uiStore'
import { ProductFormDialog } from '../../components/ProductFormDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'

const COLUMNS = 5

const ProductsList = () => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [brandId, setBrandId] = useState('')
  const [productTypeId, setProductTypeId] = useState('')
  const [dialog, setDialog] = useState<{ open: boolean; product: Products | null }>({
    open: false,
    product: null,
  })
  const [pendingDelete, setPendingDelete] = useState<Products | null>(null)
  const [deleting, setDeleting] = useState(false)
  const debouncedSearch = useDebounce(search, 350)

  const { data: brands = [] } = useGetReferencesBrands()
  const { data: productTypes = [] } = useGetReferencesProductTypes()
  const { data, isLoading } = useGetProducts({
    productName: debouncedSearch.trim() || undefined,
    brandId: brandId || undefined,
    productTypeId: productTypeId || undefined,
    page,
    limit,
  })

  const products = data?.data ?? []
  const total = data?.total ?? 0

  const confirmDelete = async () => {
    if (!pendingDelete?.productId) return
    setDeleting(true)
    try {
      await deleteProductsProductId(pendingDelete.productId)
      await invalidateProductQueries(queryClient)
      addNotification(`Deleted ${pendingDelete.productName}`, 'success')
    } catch (error) {
      addNotification(apiErrorMessage(error, 'Could not delete the product'), 'error')
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}
        >
          <Typography variant="h2">Products</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialog({ open: true, product: null })}
          >
            New product
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                placeholder="Search by product name…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                fullWidth
                size="small"
                slotProps={{ htmlInput: { 'aria-label': 'Search products by name' } }}
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="brand-filter-label">Brand</InputLabel>
                <Select
                  labelId="brand-filter-label"
                  label="Brand"
                  value={brandId}
                  onChange={(e) => {
                    setBrandId(e.target.value)
                    setPage(1)
                  }}
                >
                  <MenuItem value="">All brands</MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand.brandId} value={brand.brandId}>
                      {brand.brandName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  label="Type"
                  value={productTypeId}
                  onChange={(e) => {
                    setProductTypeId(e.target.value)
                    setPage(1)
                  }}
                >
                  <MenuItem value="">All types</MenuItem>
                  {productTypes.map((type) => (
                    <MenuItem key={type.productTypeId} value={type.productTypeId}>
                      {type.productTypeName}
                    </MenuItem>
                  ))}
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
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Brand</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={COLUMNS} align="center" sx={{ py: 4 }}>
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={COLUMNS}
                        align="center"
                        sx={{ py: 4, color: 'text.secondary' }}
                      >
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow
                        key={product.productId}
                        hover
                        onClick={() => setDialog({ open: true, product })}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{product.productName}</TableCell>
                        <TableCell>{product.brandName ?? '—'}</TableCell>
                        <TableCell>{product.productTypeName ?? '—'}</TableCell>
                        <TableCell>{product.description || '—'}</TableCell>
                        <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                          <Tooltip title="Delete product">
                            <IconButton
                              size="small"
                              aria-label={`Delete ${product.productName}`}
                              onClick={() => setPendingDelete(product)}
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

      <ProductFormDialog
        open={dialog.open}
        product={dialog.product}
        onClose={() => setDialog({ open: false, product: null })}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete product?"
        confirmLabel="Delete product"
        destructive
        isLoading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      >
        <Alert severity="warning">
          Customers’ devices are registered against products. A product that any device still uses
          cannot be deleted — otherwise those devices and their service orders would be lost with
          it. Only unused products are removed.
        </Alert>
        <Typography sx={{ mt: 1 }}>
          Delete <strong>{pendingDelete?.productName}</strong>
          {pendingDelete?.brandName ? ` (${pendingDelete.brandName})` : ''}?
        </Typography>
      </ConfirmDialog>
    </Container>
  )
}

export default ProductsList
