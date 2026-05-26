import { Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { ServiceOrder } from '../../services/serviceOrders';

export function ServiceOrdersTable({ rows }: { rows: ServiceOrder[] }) {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Customer</TableCell><TableCell>Phone</TableCell><TableCell>Device</TableCell><TableCell>Status</TableCell><TableCell align="right">Charge</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.customerName}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>{row.deviceModel}</TableCell>
              <TableCell><Chip size="small" label={row.status} /></TableCell>
              <TableCell align="right">${row.serviceCharge}</TableCell>
            </TableRow>
          ))}
          {!rows.length && <TableRow><TableCell colSpan={5}><Typography>No service orders found.</Typography></TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  );
}
