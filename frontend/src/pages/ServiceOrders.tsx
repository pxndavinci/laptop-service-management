import { Alert, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ServiceOrdersTable } from '../components/tables/ServiceOrdersTable';
import { fetchServiceOrders, ServiceOrder } from '../services/serviceOrders';

export default function ServiceOrders() {
  const [rows, setRows] = useState<ServiceOrder[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServiceOrders().then(setRows).catch(() => setError('Failed to load service orders. Check API URL and endpoint.'));
  }, []);

  const filtered = useMemo(() => rows.filter((r) => [r.customerName, r.phone, r.deviceModel].join(' ').toLowerCase().includes(search.toLowerCase())), [rows, search]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Service Orders</Typography>
      <TextField value={search} onChange={(e) => setSearch(e.target.value)} label="Search by customer, phone, or device" />
      {error && <Alert severity="warning">{error}</Alert>}
      <ServiceOrdersTable rows={filtered} />
    </Stack>
  );
}
