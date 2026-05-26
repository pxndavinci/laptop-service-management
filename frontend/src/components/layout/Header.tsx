import { AppBar, Toolbar, Typography } from '@mui/material';

export function Header() {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6">Laptop Service Management</Typography>
      </Toolbar>
    </AppBar>
  );
}
