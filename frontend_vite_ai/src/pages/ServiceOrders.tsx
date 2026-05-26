import { Chip } from '@mui/material';
import PageTitle from '../components/common/PageTitle';
import { serviceOrders } from '../services/mockData';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
export default function ServiceOrders() {
  return <><PageTitle title='Service Orders' /><TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>Customer</TableCell><TableCell>Device</TableCell><TableCell>Issue</TableCell><TableCell>Status</TableCell><TableCell>Charge</TableCell></TableRow></TableHead><TableBody>{serviceOrders.map(o=><TableRow key={o.id}><TableCell>{o.id}</TableCell><TableCell>{o.customerName}</TableCell><TableCell>{o.deviceModel}</TableCell><TableCell>{o.issue}</TableCell><TableCell><Chip label={o.status} color={o.status==='Completed'?'success':o.status==='In Progress'?'warning':'default'} size='small' /></TableCell><TableCell>${o.charge}</TableCell></TableRow>)}</TableBody></Table></TableContainer></>;
}
