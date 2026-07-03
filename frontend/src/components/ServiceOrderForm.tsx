import React, { useEffect, useMemo } from 'react'
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
import { useGetUsers } from '../api/users/users'
import { useDebounce } from './Common/debounce'

interface ServiceOrderFormProps {
  isLoading: boolean
  onSubmit: (data: ServiceOrderFormData) => Promise<void>
}

const getDateTimeLocalValue = (value = new Date()) => {
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 16)
}

const blankForm: ServiceOrderFormData = {
  userName: '',
  roleId: 1,
  contactNumber: '',
  email: '',
  address: '',
  productName: '',
  description: '',
  brandName: '',
  productTypeName: '',
  serialNumber: '',
  loginPassword: '',
  additionalInfo: '',
  estimatedPrice: 0,
  estimatedCompletionDate: getDateTimeLocalValue(),
  priorityLevel: '3',
  issueDescription: 'Hardware',
  issueNotes: '',
  entryByUserId: '',
}

export const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  isLoading = false,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderFormSchema),
    defaultValues: blankForm,
  })

  const liveUserName = watch('userName')
  const liveContactNumber = watch('contactNumber')
  const liveEmail = watch('email')
  const liveProductName = watch('productName')
  const liveBrandName = watch('brandName')
  const liveProductTypeName = watch('productTypeName')
  const liveSerialNumber = watch('serialNumber')
  const entryByUserId = watch('entryByUserId')

  const debouncedUserName = useDebounce(liveUserName, 350)
  const debouncedContactNumber = useDebounce(liveContactNumber, 350)
  const debouncedEmail = useDebounce(liveEmail, 350)
  const debouncedProductName = useDebounce(liveProductName, 350)
  const debouncedBrandName = useDebounce(liveBrandName, 350)
  const debouncedProductTypeName = useDebounce(liveProductTypeName, 350)
  const debouncedSerialNumber = useDebounce(liveSerialNumber, 350)

  const shouldSearch = Boolean(
    debouncedUserName.trim() ||
      debouncedContactNumber.trim() ||
      debouncedEmail.trim() ||
      debouncedProductName.trim() ||
      debouncedBrandName.trim() ||
      debouncedProductTypeName.trim() ||
      debouncedSerialNumber.trim(),
  )

  const { data: searchResponse, isFetching: searchLoading } = useGetServiceOrderComposerSearch(
    {
      userName: debouncedUserName || undefined,
      contactNumber: debouncedContactNumber || undefined,
      email: debouncedEmail || undefined,
      productName: debouncedProductName || undefined,
      brandName: debouncedBrandName || undefined,
      productTypeName: debouncedProductTypeName || undefined,
      serialNumber: debouncedSerialNumber || undefined,
      limit: 6,
    },
    {
      query: {
        enabled: shouldSearch,
      },
    },
  )

  const searchResults = useMemo(() => searchResponse?.data?.data ?? [], [searchResponse?.data?.data])

  const customerSuggestions = useMemo(
    () => Array.from(new Set(searchResults.map((result) => result.user?.userName).filter(Boolean))) as string[],
    [searchResults],
  )

  const contactSuggestions = useMemo(
    () =>
      Array.from(
        new Set(
          searchResults
            .flatMap((result) => result.contacts?.map((contact) => contact.contactNumber).filter(Boolean) ?? [])
            .filter(Boolean),
        ),
      ) as string[],
    [searchResults],
  )

  const productSuggestions = useMemo(
    () => Array.from(new Set(searchResults.map((result) => result.product?.productName).filter(Boolean))) as string[],
    [searchResults],
  )

  const { data: usersResponse } = useGetUsers(undefined, {
    query: {
      enabled: true,
    },
  })
  const users = useMemo(() => usersResponse?.data?.data ?? [], [usersResponse?.data?.data])

  useEffect(() => {
    if (!entryByUserId && users.length > 0) {
      setValue('entryByUserId', users[0].userId ?? '', { shouldValidate: true })
    }
  }, [entryByUserId, users, setValue])

  const showNewRecordWarning = useMemo(() => {
    const hasCustomerInput = Boolean(liveUserName.trim() || liveContactNumber.trim() || liveEmail.trim())
    const hasProductInput = Boolean(
      liveProductName.trim() || liveBrandName.trim() || liveProductTypeName.trim() || liveSerialNumber.trim(),
    )

    if (!hasCustomerInput && !hasProductInput) {
      return false
    }

    if (searchResults.length === 0) {
      return true
    }

    const hasCustomerMatch = searchResults.some((result) => {
      const normalizedUserName = liveUserName.trim().toLowerCase()
      const normalizedContact = liveContactNumber.trim().toLowerCase()
      const normalizedEmail = liveEmail.trim().toLowerCase()

      const matchesUserName = normalizedUserName
        ? result.user?.userName?.toLowerCase().includes(normalizedUserName)
        : false
      const matchesContact = normalizedContact
        ? result.contacts?.some((contact) => contact.contactNumber?.toLowerCase().includes(normalizedContact))
        : false
      const matchesEmail = normalizedEmail ? result.user?.email?.toLowerCase().includes(normalizedEmail) : false

      return matchesUserName || matchesContact || matchesEmail
    })

    const hasProductMatch = searchResults.some((result) => {
      const normalizedProductName = liveProductName.trim().toLowerCase()
      const normalizedBrand = liveBrandName.trim().toLowerCase()
      const normalizedType = liveProductTypeName.trim().toLowerCase()

      const matchesProductName = normalizedProductName
        ? result.product?.productName?.toLowerCase().includes(normalizedProductName)
        : false
      const matchesBrand = normalizedBrand ? result.product?.brand?.brandName?.toLowerCase().includes(normalizedBrand) : false
      const matchesType = normalizedType
        ? result.product?.productType?.productTypeName?.toLowerCase().includes(normalizedType)
        : false

      return matchesProductName || matchesBrand || matchesType
    })

    return (hasCustomerInput && !hasCustomerMatch) || (hasProductInput && !hasProductMatch)
  }, [
    liveUserName,
    liveContactNumber,
    liveEmail,
    liveProductName,
    liveBrandName,
    liveProductTypeName,
    liveSerialNumber,
    searchResults,
  ])

  const submitOrder = async (data: ServiceOrderFormData) => {
    await onSubmit(data)
  }

  return (
    <Box>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <form onSubmit={handleSubmit(submitOrder)}>
            <Stack spacing={3.5}>
              <Box>
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Customer details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Search existing customer context instantly. If nothing matches, a new customer record will be created with the order.
                </Typography>

                {showNewRecordWarning && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    No matching customer or product context was found. A new record will be created for this service order.
                  </Alert>
                )}

                {searchResults.length > 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Matching context found. Existing customer and product details can be reused.
                  </Alert>
                )}

                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="userName"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          freeSolo
                          options={customerSuggestions}
                          loading={searchLoading}
                          sx={{ flex: 1, minWidth: 0 }}
                          value={field.value ?? ''}
                          inputValue={field.value ?? ''}
                          onInputChange={(_, value) => field.onChange(value)}
                          onChange={(_, value) => {
                            const nextValue = typeof value === 'string' ? value : value ?? ''
                            field.onChange(nextValue)

                            const match = searchResults.find((result) => result.user?.userName === nextValue)
                            if (match) {
                              setValue('contactNumber', match.contacts?.[0]?.contactNumber ?? '', { shouldValidate: true })
                              setValue('email', match.user?.email ?? '', { shouldValidate: true })
                              setValue('address', match.user?.address ?? '', { shouldValidate: true })
                            }
                          }}
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
                          options={contactSuggestions}
                          loading={searchLoading}
                          sx={{ flex: 1, minWidth: 0 }}
                          value={field.value ?? ''}
                          inputValue={field.value ?? ''}
                          onInputChange={(_, value) => field.onChange(value)}
                          onChange={(_, value) => {
                            const nextValue = typeof value === 'string' ? value : value ?? ''
                            field.onChange(nextValue)

                            const match = searchResults.find((result) =>
                              result.contacts?.some((contact) => contact.contactNumber === nextValue),
                            )
                            if (match) {
                              setValue('userName', match.user?.userName ?? '', { shouldValidate: true })
                              setValue('email', match.user?.email ?? '', { shouldValidate: true })
                              setValue('address', match.user?.address ?? '', { shouldValidate: true })
                            }
                          }}
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
                  Add the laptop or device information. Matching product context will be suggested automatically.
                </Typography>

                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="productName"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          freeSolo
                          options={productSuggestions}
                          loading={searchLoading}
                          sx={{ flex: 1, minWidth: 0 }}
                          value={field.value ?? ''}
                          inputValue={field.value ?? ''}
                          onInputChange={(_, value) => field.onChange(value)}
                          onChange={(_, value) => {
                            const nextValue = typeof value === 'string' ? value : value ?? ''
                            field.onChange(nextValue)

                            const match = searchResults.find((result) => result.product?.productName === nextValue)
                            if (match) {
                              setValue('description', match.product?.description ?? '', { shouldValidate: true })
                              setValue('brandName', match.product?.brand?.brandName ?? '', { shouldValidate: true })
                              setValue('productTypeName', match.product?.productType?.productTypeName ?? '', { shouldValidate: true })
                            }
                          }}
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

                    <Controller
                      name="brandName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          sx={{ flex: 1, minWidth: 0 }}
                          label="Brand"
                          error={!!errors.brandName}
                          helperText={errors.brandName?.message}
                          fullWidth
                        />
                      )}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="productTypeName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Product type"
                          error={!!errors.productTypeName}
                          helperText={errors.productTypeName?.message}
                          fullWidth
                        />
                      )}
                    />
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Problem description"
                          multiline
                          minRows={3}
                          error={!!errors.description}
                          helperText={errors.description?.message}
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
                      name="serialNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Serial number"
                          error={!!errors.serialNumber}
                          helperText={errors.serialNumber?.message}
                          fullWidth
                        />
                      )}
                    />
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
                  </Stack>

                  <Controller
                    name="additionalInfo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Additional info"
                        multiline
                        minRows={2}
                        error={!!errors.additionalInfo}
                        helperText={errors.additionalInfo?.message}
                        fullWidth
                      />
                    )}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="estimatedPrice"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Estimated price"
                          value={field.value ?? 0}
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
                          value={field.value ?? getDateTimeLocalValue()}
                          error={!!errors.estimatedCompletionDate}
                          helperText={errors.estimatedCompletionDate?.message}
                          fullWidth
                        />
                      )}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                          <MenuItem value="1">1 - Highest</MenuItem>
                          <MenuItem value="2">2</MenuItem>
                          <MenuItem value="3">3</MenuItem>
                          <MenuItem value="4">4</MenuItem>
                          <MenuItem value="5">5 - Lowest</MenuItem>
                        </TextField>
                      )}
                    />
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
                          <MenuItem value="Hardware">Hardware</MenuItem>
                          <MenuItem value="Software">Software</MenuItem>
                          <MenuItem value="Network">Network</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
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

                  <Controller
                    name="entryByUserId"
                    control={control}
                    render={({ field }) => (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField
                          {...field}
                          label="Entry user"
                          error={!!errors.entryByUserId}
                          helperText={errors.entryByUserId?.message}
                          fullWidth
                        >
                          {users.map((user) => (
                            <MenuItem key={user.userId} value={user.userId ?? ''}>
                              {user.userName || user.email || user.userId}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Chip label="Auto-filled from active users" size="small" variant="outlined" />
                      </Stack>
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
    </Box>
  )
}
