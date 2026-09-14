import { useEffect, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  postReferencesBrands,
  postReferencesProductTypes,
  useGetReferencesBrands,
  useGetReferencesProductTypes,
} from '../api/reference-data/reference-data'
import {
  patchProductsProductId,
  postProducts,
  useGetProductsProductId,
} from '../api/products/products'
import type { Products } from '../api/model'
import { apiErrorMessage, apiErrorStatus } from '../lib/api/errors'
import { invalidateProductQueries } from '../lib/queries'
import { useUIStore } from '../store/uiStore'

const productSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required'),
  description: z.string().trim(),
  brandName: z.string().trim().min(1, 'Brand is required'),
  productTypeName: z.string().trim().min(1, 'Product type is required'),
})
type ProductForm = z.infer<typeof productSchema>

interface ProductFormDialogProps {
  open: boolean
  /** Product to edit. Pass `productId` instead when only the id is known. */
  product?: Products | null
  productId?: string | null
  onClose: () => void
}

const sameName = (a: string | undefined, b: string) =>
  (a ?? '').trim().toLowerCase() === b.trim().toLowerCase()

/**
 * Create or edit a product. Brand and type accept free text: a name that does
 * not exist yet is created through the reference endpoints before the product.
 */
export const ProductFormDialog = ({
  open,
  product: productProp,
  productId,
  onClose,
}: ProductFormDialogProps) => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: fetched, isLoading: loadingProduct } = useGetProductsProductId(productId ?? '', {
    query: { enabled: open && !productProp && !!productId },
  })
  const product = productProp ?? (productId ? fetched : null)
  const isEdit = !!product?.productId || !!productId

  const { data: brands = [] } = useGetReferencesBrands({ query: { enabled: open } })
  const { data: productTypes = [] } = useGetReferencesProductTypes({ query: { enabled: open } })

  const { control, register, handleSubmit, reset, setError, formState } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { productName: '', description: '', brandName: '', productTypeName: '' },
  })
  const { errors } = formState

  useEffect(() => {
    if (!open) return
    reset({
      productName: product?.productName ?? '',
      description: product?.description ?? '',
      brandName: product?.brandName ?? '',
      productTypeName: product?.productTypeName ?? '',
    })
  }, [open, product, reset])

  const close = () => {
    setFormError(null)
    onClose()
  }

  const resolveBrandId = async (name: string) => {
    const existing = brands.find((brand) => sameName(brand.brandName, name))
    if (existing?.brandId) return existing.brandId
    return (await postReferencesBrands({ brandName: name.trim() })).brandId!
  }

  const resolveProductTypeId = async (name: string) => {
    const existing = productTypes.find((type) => sameName(type.productTypeName, name))
    if (existing?.productTypeId) return existing.productTypeId
    return (await postReferencesProductTypes({ typeName: name.trim() })).productTypeId!
  }

  const onSubmit = async (data: ProductForm) => {
    setSaving(true)
    setFormError(null)
    try {
      const [brandId, productTypeId] = await Promise.all([
        resolveBrandId(data.brandName),
        resolveProductTypeId(data.productTypeName),
      ])
      if (isEdit) {
        await patchProductsProductId(product?.productId ?? productId!, {
          productName: data.productName,
          description: data.description || null,
          brandId,
          productTypeId,
        })
      } else {
        await postProducts({
          productName: data.productName,
          description: data.description || undefined,
          brandId,
          productTypeId,
        })
      }
      await invalidateProductQueries(queryClient)
      addNotification(isEdit ? 'Product updated' : 'Product created', 'success')
      close()
    } catch (error) {
      // A new brand/type may already have been created; refresh the options either way
      await invalidateProductQueries(queryClient)
      if (apiErrorStatus(error) === 409) {
        setError('productName', {
          message: apiErrorMessage(error, 'This product already exists for that brand and type'),
        })
      } else {
        setFormError(apiErrorMessage(error, 'Could not save the product'))
      }
    } finally {
      setSaving(false)
    }
  }

  const freeText = (name: 'brandName' | 'productTypeName', label: string, options: string[]) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          freeSolo
          options={options}
          value={field.value}
          onChange={(_, value) => field.onChange(value ?? '')}
          inputValue={field.value}
          onInputChange={(_, value) => field.onChange(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              required
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message ??
                (field.value.trim() && !options.some((option) => sameName(option, field.value))
                  ? `“${field.value.trim()}” will be added as a new ${label.toLowerCase()}`
                  : ' ')
              }
            />
          )}
        />
      )}
    />
  )

  return (
    <Dialog open={open} onClose={saving ? undefined : close} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{isEdit ? 'Edit product' : 'New product'}</DialogTitle>
        <DialogContent>
          {productId && !productProp && loadingProduct ? (
            <Stack sx={{ py: 4, alignItems: 'center' }}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <TextField
                label="Product name"
                required
                fullWidth
                autoFocus
                {...register('productName')}
                error={!!errors.productName}
                helperText={errors.productName?.message}
              />
              {freeText(
                'brandName',
                'Brand',
                brands.map((brand) => brand.brandName ?? '').filter(Boolean),
              )}
              {freeText(
                'productTypeName',
                'Product type',
                productTypes.map((type) => type.productTypeName ?? '').filter(Boolean),
              )}
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={2}
                {...register('description')}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
