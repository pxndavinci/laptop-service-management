import { AppBar, Toolbar, Typography, Box } from '@mui/material';
export default function Header() {
  return <AppBar position='fixed'><Toolbar><Typography variant='h6'>Laptop Service Management</Typography><Box sx={{ flexGrow: 1 }} /></Toolbar></AppBar>;
}
