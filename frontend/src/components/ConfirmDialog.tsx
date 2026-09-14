import { ReactNode, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel?: string
  /** When set, the user must type this exact text before confirming. */
  requireText?: string
  destructive?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
}

/** Replaces window.confirm: explicit, styled, and optionally typed confirmation. */
export const ConfirmDialog = ({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  requireText,
  destructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => {
  const [typed, setTyped] = useState('')
  const blocked = !!requireText && typed.trim() !== requireText.trim()

  const close = () => {
    if (isLoading) return
    setTyped('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {children}
        {requireText && (
          <>
            <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
              Type <strong>{requireText}</strong> to confirm.
            </Typography>
            <TextField
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              fullWidth
              autoFocus
              slotProps={{ htmlInput: { 'aria-label': 'Confirmation text' } }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={blocked || isLoading}
          onClick={() => {
            setTyped('')
            onConfirm()
          }}
        >
          {isLoading ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
