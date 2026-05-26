import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    primary: { main: '#0d47a1' },
    secondary: { main: '#00897b' },
    background: { default: '#f5f7fb' },
  },
  shape: { borderRadius: 10 },
});
