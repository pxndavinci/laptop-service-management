import React from 'react'
import { Box, TextField, Button, Stack, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
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
    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
        Reporting period
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'flex-end' } }}>
        <TextField
          type="date"
          label="Start Date"
          value={dateRangeStart || ''}
          onChange={handleStartDateChange}
          slotProps={{ inputLabel: { shrink: true } }}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <TextField
          type="date"
          label="End Date"
          value={dateRangeEnd || ''}
          onChange={handleEndDateChange}
          slotProps={{ inputLabel: { shrink: true } }}
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
