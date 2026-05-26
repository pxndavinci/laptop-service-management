import React from 'react'
import { Box, TextField, Button, Stack } from '@mui/material'
import { Clear as ClearIcon } from '@mui/icons-material'
import { useFilterStore } from '../../store/filterStore'

export const DateRangeFilter: React.FC = () => {
  const dateRangeStart = useFilterStore((state) => state.dateRangeStart)
  const dateRangeEnd = useFilterStore((state) => state.dateRangeEnd)
  const setDateRange = useFilterStore((state) => state.setDateRange)

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(e.target.value, dateRangeEnd)
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(dateRangeStart, e.target.value)
  }

  const handleClear = () => {
    setDateRange(undefined, undefined)
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
        <TextField
          type="date"
          label="Start Date"
          value={dateRangeStart || ''}
          onChange={handleStartDateChange}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <TextField
          type="date"
          label="End Date"
          value={dateRangeEnd || ''}
          onChange={handleEndDateChange}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClear}
          size="small"
        >
          Clear
        </Button>
      </Stack>
    </Box>
  )
}
