import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
export default function SimpleTable({ headers, rows }: { headers: string[]; rows: (string|number)[][] }) {
  return <TableContainer component={Paper}><Table><TableHead><TableRow>{headers.map(h=><TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map((r,i)=><TableRow key={i}>{r.map((c,j)=><TableCell key={j}>{c}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer>;
}
