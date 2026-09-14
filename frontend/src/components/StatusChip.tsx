import { Chip, ChipProps } from '@mui/material'
import { humanize } from '../lib/format'
import { STATUS, STATUS_COLORS } from '../lib/statuses'

/** Repair status chip; a missing status is shown as Received. */
export const StatusChip = ({
  status,
  size = 'small',
}: {
  status: string | null | undefined
  size?: ChipProps['size']
}) => {
  const name = status ?? STATUS.RECEIVED
  return (
    <Chip
      label={humanize(name)}
      size={size}
      color={STATUS_COLORS[name] ?? 'default'}
      variant={name === STATUS.RECEIVED ? 'outlined' : 'filled'}
    />
  )
}
