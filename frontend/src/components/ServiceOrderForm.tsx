import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { serviceOrderFormSchema, ServiceOrderFormData } from '../lib/schemas/serviceOrderSchema'
import { useDraftAutoSave, useLoadDraft } from '../lib/hooks/useDraftAutoSave'
import { useCustomers } from '../lib/hooks/useCustomers'
import { useProducts } from '../lib/hooks/useProducts'
import { useUIStore } from '../store/uiStore'
import { Customer } from '../types'

interface ServiceOrderFormProps {
  initialData?: Partial<ServiceOrderFormData>
  isNew?: boolean
  onSubmit: (data: ServiceOrderFormData) => Promise<void>
  isLoading?: boolean
}

const blankForm: ServiceOrderFormData = {
  customerId: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
  customerCity: '',
  customerZipCode: '',
  productId: '',
  description: '',
  status: 'draft',
  priority: 'medium',
  estimatedCompletionDate: '',
  totalCost: 0,
  notes: '',
}

export const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  initialData,
  isNew = true,
  onSubmit,
  isLoading = false,
}) => {
  const [showRecovery, setShowRecovery] = useState(false)
  const [showMatches, setShowMatches] = useState(false)
  const addNotification = useUIStore((state) => state.addNotification)
  const draftId = useMemo(
    () => `service-order-${isNew ? 'new' : initialData?.orderNumber || 'edit'}`,
    [initialData?.orderNumber, isNew]
  )
  const { draftData, draftExists, removeDraft } = useLoadDraft(draftId, 'service-order')
  const { data: customers, isLoading: customersLoading } = useCustomers({ limit: 100 })
  const { data: products, isLoading: productsLoading } = useProducts({ limit: 100 })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderFormSchema),
    defaultValues: { ...blankForm, ...initialData },
  })

  const formData = watch()
  useDraftAutoSave(formData, {
    draftId,
    draftType: 'service-order',
    debounceMs: 500,
    enabled: !draftExists || !showRecovery,
  })

  useEffect(() => {
    setShowRecovery(draftExists)
  }, [draftExists])

  const customerQuery = `${formData.customerName} ${formData.customerPhone}`.trim().toLowerCase()
  const matchingCustomers = (customers?.data || []).filter((customer) => {
    if (!customerQuery) return false
    const searchableText = `${customer.name} ${customer.phone}`.toLowerCase()
    return customerQuery
      .split(/\s+/)
      .every((queryPart) => searchableText.includes(queryPart))
  })

  const clearSelectedCustomer = () => {
    setValue('customerId', '')
    setShowMatches(true)
  }

  const selectCustomer = (customer: Customer) => {
    setValue('customerId', customer.id)
    setValue('customerName', customer.name)
    setValue('customerPhone', customer.phone)
    setValue('customerEmail', customer.email || '')
    setValue('customerAddress', customer.address || '')
    setValue('customerCity', customer.city || '')
    setValue('customerZipCode', customer.zipCode || '')
    setShowMatches(false)
  }

  const submitOrder = async (data: ServiceOrderFormData) => {
    if (data.customerId) {
      await onSubmit(data)
      return
    }

    if (customersLoading) {
      setError('customerPhone', {
        type: 'manual',
        message: 'Please wait while existing customers are checked.',
      })
      return
    }

    const normalizedPhone = data.customerPhone.trim().toLowerCase()
    const existingMatches = (customers?.data || []).filter((customer) => {
      return normalizedPhone && customer.phone.trim().toLowerCase() === normalizedPhone
    })

    if (existingMatches.length === 1) {
      await onSubmit({ ...data, customerId: existingMatches[0].id })
      return
    }

    if (existingMatches.length > 1) {
      setError('customerPhone', {
        type: 'manual',
        message: 'More than one customer matches. Select the correct customer below.',
      })
      setShowMatches(true)
      return
    }

    await onSubmit(data)
  }

  const handleRecovery = () => {
    reset(draftData as ServiceOrderFormData)
    setShowRecovery(false)
    addNotification('Draft recovered successfully', 'success')
  }

  const handleDiscardDraft = () => {
    removeDraft()
    setShowRecovery(false)
    reset(blankForm)
    addNotification('Draft discarded', 'info')
  }

  return (
    <Box>
      {draftExists && showRecovery && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setShowRecovery(false)}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography>You have an unsaved draft. Would you like to recover it?</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={handleRecovery} variant="contained">Recover</Button>
              <Button size="small" onClick={handleDiscardDraft} variant="outlined">Discard</Button>
            </Stack>
          </Box>
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <form onSubmit={handleSubmit(submitOrder)}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>Customer Details</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter a name or mobile number. Select an existing match below, or a new customer will be created with this order.
                </Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="customerName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Customer Name"
                          error={!!errors.customerName}
                          helperText={errors.customerName?.message}
                          onFocus={() => setShowMatches(true)}
                          onChange={(event) => {
                            field.onChange(event)
                            clearSelectedCustomer()
                          }}
                          fullWidth
                        />
                      )}
                    />
                    <Controller
                      name="customerPhone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Mobile Number"
                          error={!!errors.customerPhone}
                          helperText={errors.customerPhone?.message}
                          onFocus={() => setShowMatches(true)}
                          onChange={(event) => {
                            field.onChange(event)
                            clearSelectedCustomer()
                          }}
                          fullWidth
                        />
                      )}
                    />
                  </Stack>

                  {showMatches && customerQuery && (
                    <Paper variant="outlined">
                      {customersLoading ? (
                        <Typography sx={{ p: 2 }} color="text.secondary">Finding customers...</Typography>
                      ) : matchingCustomers.length > 0 ? (
                        <List disablePadding>
                          {matchingCustomers.map((customer) => (
                            <ListItemButton key={customer.id} onMouseDown={() => selectCustomer(customer)}>
                              <ListItemText primary={customer.name} secondary={customer.phone} />
                            </ListItemButton>
                          ))}
                        </List>
                      ) : (
                        <Typography sx={{ p: 2 }} color="text.secondary">
                          No matching customer. A new customer will be created when you save.
                        </Typography>
                      )}
                    </Paper>
                  )}

                  <Controller
                    name="customerEmail"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email (Optional)"
                        error={!!errors.customerEmail}
                        helperText={errors.customerEmail?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="customerAddress"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Address (Optional)" fullWidth />}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="customerCity"
                      control={control}
                      render={({ field }) => <TextField {...field} label="City (Optional)" fullWidth />}
                    />
                    <Controller
                      name="customerZipCode"
                      control={control}
                      render={({ field }) => <TextField {...field} label="ZIP Code (Optional)" fullWidth />}
                    />
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Service Details</Typography>
                <Stack spacing={2}>
                  <Controller
                    name="productId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.productId}>
                        <InputLabel>Service Required</InputLabel>
                        <Select {...field} label="Service Required">
                          {productsLoading && <MenuItem disabled>Loading services...</MenuItem>}
                          {(products?.data || []).map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name} - ${product.unitPrice.toLocaleString()}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.productId && (
                          <Typography variant="caption" color="error" sx={{ ml: 1.75, mt: 0.5 }}>
                            {errors.productId.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Problem Description"
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Priority</InputLabel>
                          <Select {...field} label="Priority">
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select {...field} label="Status">
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="estimatedCompletionDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="date"
                          label="Estimated Completion Date"
                          slotProps={{ inputLabel: { shrink: true } }}
                          error={!!errors.estimatedCompletionDate}
                          helperText={errors.estimatedCompletionDate?.message}
                          fullWidth
                        />
                      )}
                    />
                    <Controller
                      name="totalCost"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Service Charge"
                          error={!!errors.totalCost}
                          helperText={errors.totalCost?.message}
                          fullWidth
                          onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                        />
                      )}
                    />
                  </Stack>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Technician Notes (Optional)" multiline rows={3} fullWidth />
                    )}
                  />
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Create Service Order'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
