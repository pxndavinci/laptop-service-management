import { Paper, Typography } from '@mui/material';

export default function Customers() {
  return <Paper sx={{ p: 3 }}><Typography variant="h4" mb={1}>Customers</Typography><Typography>Customer list and search by name/phone will be connected to backend endpoints.</Typography></Paper>;
}
