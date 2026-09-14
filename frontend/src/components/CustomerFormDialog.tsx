import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/RemoveCircleOutlineOutlined'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { postUsers, patchUsersUserId } from '../api/users/users'
import {
  deleteContactsContactId,
  patchContactsContactId,
  postContacts,
} from '../api/contacts/contacts'
import type { Contacts, Users } from '../api/model'
import { CUSTOMER_ROLE_ID } from '../lib/config'
import { apiErrorMessage, apiErrorStatus } from '../lib/api/errors'
import { invalidateCustomerQueries } from '../lib/queries'
import { useUIStore } from '../store/uiStore'

const customerSchema = z.object({
  userName: z.string().trim().min(1, 'Name is required'),
  email: z.union([z.string().trim().email('Enter a valid email address'), z.literal('')]),
  address: z.string().trim(),
  contacts: z
    .array(
      z.object({
        contactId: z.string().optional(),
        contactNumber: z
          .string()
          .trim()
          .min(1, 'Enter a number or remove this row')
          .regex(/^[0-9+]+$/, "Only numbers and '+' are allowed"),
      }),
    )
    .min(1, 'Add at least one contact number'),
})
type CustomerForm = z.infer<typeof customerSchema>

interface CustomerFormDialogProps {
  open: boolean
  /** Existing customer to edit; omit to create a new one. */
  customer?: Users | null
  /** The customer's current contact numbers (edit mode). */
  contacts?: Contacts[]
  onClose: () => void
  onSaved?: (userId: string) => void
}

/**
 * Create or edit a customer and their contact numbers.
 * Create: POST /users, then POST /contacts per number.
 * Edit: PATCH /users/:id, then create/update/delete contacts to match the form.
 */
export const CustomerFormDialog = ({
  open,
  customer,
  contacts = [],
  onClose,
  onSaved,
}: CustomerFormDialogProps) => {
  const queryClient = useQueryClient()
  const addNotification = useUIStore((state) => state.addNotification)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const isEdit = !!customer?.userId

  const { control, register, handleSubmit, reset, setError, formState } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { userName: '', email: '', address: '', contacts: [{ contactNumber: '' }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'contacts' })
  const { errors } = formState

  useEffect(() => {
    if (!open) return
    reset({
      userName: customer?.userName ?? '',
      email: customer?.email ?? '',
      address: customer?.address ?? '',
      contacts:
        contacts.length > 0
          ? contacts.map((contact) => ({
              contactId: contact.contactId,
              contactNumber: contact.contactNumber ?? '',
            }))
          : [{ contactNumber: '' }],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when (re)opened
  }, [open, customer?.userId, reset])

  const close = () => {
    setFormError(null)
    onClose()
  }

  const syncContacts = async (userId: string, wanted: CustomerForm['contacts']) => {
    const wantedIds = new Set(wanted.map((row) => row.contactId).filter(Boolean))
    const original = new Map(contacts.map((contact) => [contact.contactId, contact.contactNumber]))
    const operations: Promise<unknown>[] = [
      ...contacts
        .filter((contact) => contact.contactId && !wantedIds.has(contact.contactId))
        .map((contact) => deleteContactsContactId(contact.contactId!)),
      ...wanted.map((row) =>
        !row.contactId
          ? postContacts({ userId, contactNumber: row.contactNumber })
          : original.get(row.contactId) !== row.contactNumber
            ? patchContactsContactId(row.contactId, { contactNumber: row.contactNumber })
            : Promise.resolve(),
      ),
    ]
    const results = await Promise.allSettled(operations)
    return results.filter((result) => result.status === 'rejected').length
  }

  const onSubmit = async (data: CustomerForm) => {
    setSaving(true)
    setFormError(null)
    let userId = customer?.userId
    try {
      if (isEdit) {
        await patchUsersUserId(userId!, {
          userName: data.userName,
          email: data.email || null,
          address: data.address || null,
        })
      } else {
        const created = await postUsers({
          userName: data.userName,
          roleId: CUSTOMER_ROLE_ID,
          email: data.email || undefined,
          address: data.address || undefined,
        })
        userId = created.userId!
      }
    } catch (error) {
      setSaving(false)
      if (apiErrorStatus(error) === 409) {
        setError('email', { message: apiErrorMessage(error, 'This email is already in use') })
      } else {
        setFormError(apiErrorMessage(error, 'Could not save the customer'))
      }
      return
    }

    const failedContacts = await syncContacts(userId!, data.contacts)
    await invalidateCustomerQueries(queryClient)
    setSaving(false)

    if (failedContacts > 0) {
      addNotification(
        `Customer saved, but ${failedContacts} contact number change(s) failed. Edit to retry.`,
        'warning',
      )
    } else {
      addNotification(isEdit ? 'Customer updated' : 'Customer created', 'success')
    }
    onSaved?.(userId!)
    close()
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : close} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{isEdit ? 'Edit customer' : 'New customer'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Name"
              required
              fullWidth
              autoFocus
              {...register('userName')}
              error={!!errors.userName}
              helperText={errors.userName?.message}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField label="Address" fullWidth multiline minRows={2} {...register('address')} />

            <Typography variant="subtitle2">Contact numbers</Typography>
            {fields.map((field, index) => (
              <Stack key={field.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <TextField
                  label={`Contact number ${index + 1}`}
                  fullWidth
                  slotProps={{ htmlInput: { inputMode: 'tel' } }}
                  {...register(`contacts.${index}.contactNumber`)}
                  error={!!errors.contacts?.[index]?.contactNumber}
                  helperText={errors.contacts?.[index]?.contactNumber?.message}
                />
                <IconButton
                  aria-label={`Remove contact number ${index + 1}`}
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  sx={{ mt: 0.5 }}
                >
                  <RemoveIcon />
                </IconButton>
              </Stack>
            ))}
            {errors.contacts?.root?.message && (
              <Typography color="error" variant="caption">
                {errors.contacts.root.message}
              </Typography>
            )}
            <Button
              startIcon={<AddIcon />}
              onClick={() => append({ contactNumber: '' })}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add number
            </Button>
          </Stack>
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
