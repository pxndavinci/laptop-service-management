import { useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { serviceOrderFormSchema, ServiceOrderFormData } from '../lib/schemas/serviceOrderSchema'
import { useGetServiceOrderComposerSearch } from '../api/service-orders/service-orders'
import type { ComposerContact, ServiceOrderComposerSearchResult } from '../api/model'
import { useDebounce } from '../lib/hooks/useDebounce'

/**
 * References to records the operator picked from search suggestions. They are
 * submitted as `existing` so the backend reuses those records instead of
 * matching by name, and they are cleared whenever the matching fields are
 * edited by hand.
 */
export interface ExistingLinks {
  userId?: string
  contactId?: string
  brandId?: string
  productTypeId?: string
  productId?: string
  userProductId?: string
}

interface ServiceOrderFormProps {
  isLoading: boolean
  onSubmit: (data: ServiceOrderFormData, links: ExistingLinks) => Promise<void>
}

/** Tomorrow, formatted for a datetime-local input. */
const defaultCompletionDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

const blankForm = (): ServiceOrderFormData => ({
  userName: '',
  contactNumber: '',
  email: '',
  address: '',
  productName: '',
  brandName: '',
  productTypeName: 'Laptop',
  description: '',
  serialNumber: '',
  loginPassword: '',
  additionalInfo: '',
  estimatedPrice: 0,
  estimatedCompletionDate: defaultCompletionDate(),
  priorityLevel: 3,
  issueDescription: 'HARDWARE',
  issueNotes: '',
})

const uniqueBy = <T,>(items: T[], key: (item: T) => string | undefined): T[] => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const k = key(item)
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export const ServiceOrderForm = ({ isLoading = false, onSubmit }: ServiceOrderFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderFormSchema),
    defaultValues: blankForm(),
  })

  const [links, setLinks] = useState<ExistingLinks>({})

  const liveUserName = watch('userName')
  const liveContactNumber = watch('contactNumber')
  const liveEmail = watch('email')
  const liveProductName = watch('productName')
  const liveSerialNumber = watch('serialNumber')

  const debouncedUserName = useDebounce(liveUserName, 350)
  const debouncedContactNumber = useDebounce(liveContactNumber, 350)
  const debouncedEmail = useDebounce(liveEmail, 350)
  const debouncedProductName = useDebounce(liveProductName, 350)
  const debouncedSerialNumber = useDebounce(liveSerialNumber, 350)

  const shouldSearch = Boolean(
    debouncedUserName.trim() ||
      debouncedContactNumber.trim() ||
      debouncedEmail.trim() ||
      debouncedProductName.trim() ||
      debouncedSerialNumber.trim()
  )

  const { data: searchResponse, isFetching: searchLoading } = useGetServiceOrderComposerSearch(
    {
      userName: debouncedUserName.trim() || undefined,
      contactNumber: debouncedContactNumber.trim() || undefined,
      email: debouncedEmail.trim() || undefined,
      productName: debouncedProductName.trim() || undefined,
      serialNumber: debouncedSerialNumber.trim() || undefined,
      limit: 6,
    },
    { query: { enabled: shouldSearch } },
  )
  const searchResults = useMemo(() => searchResponse?.data ?? [], [searchResponse?.data])

  const customerOptions = useMemo(
    () => uniqueBy(searchResults.filter((r) => r.user?.userName), (r) => r.user?.userId),
    [searchResults],
  )
  const contactOptions = useMemo(
    () =>
      uniqueBy(
        searchResults.flatMap(
          (result) => result.contacts?.map((contact) => ({ contact, result })) ?? [],
        ),
        (option) => option.contact.contactId,
      ),
    [searchResults],
  )
  const productOptions = useMemo(
    () => uniqueBy(searchResults.filter((r) => r.product), (r) => r.product?.productId),
    [searchResults],
  )
  const serialOptions = useMemo(
    () => uniqueBy(searchResults.filter((r) => r.userProduct), (r) => r.userProduct?.userProductId),
    [searchResults],
  )

  // ---- Linking pieces of an existing context into the form ----

  const applyCustomer = (result: ServiceOrderComposerSearchResult, contact?: ComposerContact) => {
    const linkedContact = contact ?? result.contacts?.[0]
    setValue('userName', result.user?.userName ?? '', { shouldValidate: true })
    setValue('contactNumber', linkedContact?.contactNumber ?? '', { shouldValidate: true })
    setValue('email', result.user?.email ?? '')
    setValue('address', result.user?.address ?? '')
    setLinks((prev) => ({
      ...prev,
      userId: result.user?.userId,
      contactId: linkedContact?.contactId,
    }))
  }

  const applyProduct = (result: ServiceOrderComposerSearchResult) => {
    setValue('productName', result.product?.productName ?? '', { shouldValidate: true })
    setValue('brandName', result.product?.brand?.brandName ?? '', { shouldValidate: true })
    setValue('productTypeName', result.product?.productType?.productTypeName ?? '', {
      shouldValidate: true,
    })
    setValue('description', result.product?.description ?? '')
    setLinks((prev) => ({
      ...prev,
      brandId: result.product?.brand?.brandId,
      productTypeId: result.product?.productType?.productTypeId,
      productId: result.product?.productId,
    }))
  }

  // A serial number identifies the device, its product and its owner.
  const applyFullContext = (result: ServiceOrderComposerSearchResult) => {
    applyCustomer(result)
    applyProduct(result)
    setValue('serialNumber', result.userProduct?.serialNumber ?? '', { shouldValidate: true })
    setValue('loginPassword', result.userProduct?.loginPassword ?? '')
    setValue('additionalInfo', result.userProduct?.additionalInfo ?? '')
    setLinks((prev) => ({ ...prev, userProductId: result.userProduct?.userProductId }))
  }

  const clearCustomerLink = () =>
    setLinks(({ userId, contactId, ...rest }) => rest)

  const clearProductLink = () =>
    setLinks(({ brandId, productTypeId, productId, userProductId, ...rest }) => rest)

  const clearDeviceLink = () => setLinks(({ userProductId, ...rest }) => rest)

  const submitOrder = async (data: ServiceOrderFormData) => {
    await onSubmit(data, links)
    reset(blankForm())
    setLinks({})
  }

  const customerLinked = Boolean(links.userId)
  const deviceLinked = Boolean(links.userProductId)
  const productLinked = Boolean(links.productId)

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <form onSubmit={handleSubmit(submitOrder)}>
          <Stack spacing={3.5}>
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                Customer details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start typing to search existing customers. Picking a suggestion links the record;
                anything else creates a new customer with the order.
              </Typography>

              {shouldSearch && !searchLoading && searchResults.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No existing records match. New customer and device records will be created with
                  this order.
                </Alert>
              )}

              {(customerLinked || productLinked || deviceLinked) && (
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                  {customerLinked && (
                    <Chip
                      label="Existing customer linked"
                      color="success"
                      size="small"
                      onDelete={clearCustomerLink}
                    />
                  )}
                  {productLinked && (
                    <Chip
                      label="Existing product linked"
                      color="success"
                      size="small"
                      onDelete={clearProductLink}
                    />
                  )}
                  {deviceLinked && (
                    <Chip
                      label="Existing device linked"
                      color="success"
                      size="small"
                      onDelete={clearDeviceLink}
                    />
                  )}
                </Stack>
              )}

              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="userName"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        freeSolo
                        options={customerOptions}
                        getOptionLabel={(option) =>
                          typeof option === 'string' ? option : option.user?.userName ?? ''
                        }
                        filterOptions={(options) => options}
                        loading={searchLoading}
                        sx={{ flex: 1, minWidth: 0 }}
                        inputValue={field.value}
                        onInputChange={(_, value, reason) => {
                          if (reason === 'input' || reason === 'clear') {
                            field.onChange(value)
                            clearCustomerLink()
                          }
                        }}
                        onChange={(_, value) => {
                          if (value && typeof value !== 'string') {
                            applyCustomer(value)
                          }
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option.user?.userId}>
                            <Box>
                              <Typography variant="body2">{option.user?.userName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {[option.contacts?.[0]?.contactNumber, option.user?.email]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </Typography>
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Customer name"
                            error={!!errors.userName}
                            helperText={errors.userName?.message}
                            fullWidth
                          />
                        )}
                      />
                    )}
                  />

                  <Controller
                    name="contactNumber"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        freeSolo
                        options={contactOptions}
                        getOptionLabel={(option) =>
                          typeof option === 'string' ? option : option.contact.contactNumber ?? ''
                        }
                        filterOptions={(options) => options}
                        loading={searchLoading}
                        sx={{ flex: 1, minWidth: 0 }}
                        inputValue={field.value}
                        onInputChange={(_, value, reason) => {
                          if (reason === 'input' || reason === 'clear') {
                            field.onChange(value)
                            clearCustomerLink()
                          }
                        }}
                        onChange={(_, value) => {
                          if (value && typeof value !== 'string') {
                            applyCustomer(value.result, value.contact)
                          }
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option.contact.contactId}>
                            <Box>
                              <Typography variant="body2">{option.contact.contactNumber}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.result.user?.userName}
                              </Typography>
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Contact number"
                            error={!!errors.contactNumber}
                            helperText={errors.contactNumber?.message}
                            fullWidth
                          />
                        )}
                      />
                    )}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(event) => {
                          field.onChange(event)
                          clearCustomerLink()
                        }}
                        label="Email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(event) => {
                          field.onChange(event)
                          clearCustomerLink()
                        }}
                        label="Address"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        fullWidth
                      />
                    )}
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                Device details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Picking a serial number fills the whole form from the matching device and its
                owner.
              </Typography>

              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="serialNumber"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        freeSolo
                        options={serialOptions}
                        getOptionLabel={(option) =>
                          typeof option === 'string'
                            ? option
                            : option.userProduct?.serialNumber ?? ''
                        }
                        filterOptions={(options) => options}
                        loading={searchLoading}
                        sx={{ flex: 1, minWidth: 0 }}
                        inputValue={field.value}
                        onInputChange={(_, value, reason) => {
                          if (reason === 'input' || reason === 'clear') {
                            field.onChange(value)
                            clearDeviceLink()
                          }
                        }}
                        onChange={(_, value) => {
                          if (value && typeof value !== 'string') {
                            applyFullContext(value)
                          }
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option.userProduct?.userProductId}>
                            <Box>
                              <Typography variant="body2">
                                {option.userProduct?.serialNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {[option.product?.productName, option.user?.userName]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </Typography>
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Serial number"
                            error={!!errors.serialNumber}
                            helperText={errors.serialNumber?.message}
                            fullWidth
                          />
                        )}
                      />
                    )}
                  />

                  <Controller
                    name="productName"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        freeSolo
                        options={productOptions}
                        getOptionLabel={(option) =>
                          typeof option === 'string' ? option : option.product?.productName ?? ''
                        }
                        filterOptions={(options) => options}
                        loading={searchLoading}
                        sx={{ flex: 1, minWidth: 0 }}
                        inputValue={field.value}
                        onInputChange={(_, value, reason) => {
                          if (reason === 'input' || reason === 'clear') {
                            field.onChange(value)
                            clearProductLink()
                          }
                        }}
                        onChange={(_, value) => {
                          if (value && typeof value !== 'string') {
                            applyProduct(value)
                          }
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option.product?.productId}>
                            <Box>
                              <Typography variant="body2">{option.product?.productName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {[
                                  option.product?.brand?.brandName,
                                  option.product?.productType?.productTypeName,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </Typography>
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Product name"
                            error={!!errors.productName}
                            helperText={errors.productName?.message}
                            fullWidth
                          />
                        )}
                      />
                    )}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="brandName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(event) => {
                          field.onChange(event)
                          clearProductLink()
                        }}
                        label="Brand"
                        error={!!errors.brandName}
                        helperText={errors.brandName?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="productTypeName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(event) => {
                          field.onChange(event)
                          clearProductLink()
                        }}
                        label="Product type"
                        error={!!errors.productTypeName}
                        helperText={errors.productTypeName?.message}
                        fullWidth
                      />
                    )}
                  />
                </Stack>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Product description"
                      multiline
                      minRows={2}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      fullWidth
                    />
                  )}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="loginPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Login password"
                        error={!!errors.loginPassword}
                        helperText={errors.loginPassword?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="additionalInfo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Additional info"
                        error={!!errors.additionalInfo}
                        helperText={errors.additionalInfo?.message}
                        fullWidth
                      />
                    )}
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                Service details
              </Typography>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="issueDescription"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Issue type"
                        error={!!errors.issueDescription}
                        helperText={errors.issueDescription?.message}
                        fullWidth
                      >
                        <MenuItem value="HARDWARE">Hardware</MenuItem>
                        <MenuItem value="SOFTWARE">Software</MenuItem>
                        <MenuItem value="NETWORK">Network</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </TextField>
                    )}
                  />
                  <Controller
                    name="priorityLevel"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Priority"
                        error={!!errors.priorityLevel}
                        helperText={errors.priorityLevel?.message}
                        fullWidth
                      >
                        <MenuItem value={1}>1 - Highest</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={5}>5 - Lowest</MenuItem>
                      </TextField>
                    )}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="estimatedPrice"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Estimated price"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                        error={!!errors.estimatedPrice}
                        helperText={errors.estimatedPrice?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="estimatedCompletionDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="datetime-local"
                        label="Estimated completion"
                        slotProps={{ inputLabel: { shrink: true } }}
                        error={!!errors.estimatedCompletionDate}
                        helperText={errors.estimatedCompletionDate?.message}
                        fullWidth
                      />
                    )}
                  />
                </Stack>

                <Controller
                  name="issueNotes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Issue notes"
                      multiline
                      minRows={2}
                      error={!!errors.issueNotes}
                      helperText={errors.issueNotes?.message}
                      fullWidth
                    />
                  )}
                />
              </Stack>
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create service order'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
