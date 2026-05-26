import { alpha, createTheme } from '@mui/material/styles'

const primary = '#1B5E57'
const accent = '#E38638'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primary,
      light: '#3D827A',
      dark: '#12463F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: accent,
      light: '#F1AA67',
      dark: '#BA5D18',
      contrastText: '#FFFFFF',
    },
    success: { main: '#268A62' },
    warning: { main: '#D9822B' },
    error: { main: '#C84B47' },
    info: { main: '#2874A6' },
    background: {
      default: '#F5F6F2',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#172523',
      secondary: '#62716E',
    },
    divider: '#E4E9E5',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.35rem', fontWeight: 700, letterSpacing: '-0.04em' },
    h2: { fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.035em' },
    h3: { fontSize: '1.45rem', fontWeight: 700 },
    h4: { fontSize: '1.3rem', fontWeight: 700 },
    h5: { fontSize: '1.1rem', fontWeight: 700 },
    h6: { fontSize: '1rem', fontWeight: 650 },
    body1: { lineHeight: 1.55 },
    body2: { lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F6F2',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 10,
          paddingLeft: 18,
          paddingRight: 18,
          '&.MuiButton-containedPrimary': {
            boxShadow: `0 8px 18px ${alpha(primary, 0.2)}`,
            '&:hover': {
              boxShadow: `0 10px 24px ${alpha(primary, 0.28)}`,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E9EDE9',
          boxShadow: '0 4px 22px rgba(28, 43, 39, 0.045)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: '22px 24px 8px' },
        title: { fontSize: '1.05rem', fontWeight: 650 },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': { paddingBottom: 24 },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 44,
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#AEBDB9',
          },
        },
        notchedOutline: { borderColor: '#D8E0DC' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: '#62716E' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, textTransform: 'capitalize' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            color: '#52625F',
            backgroundColor: '#F7F8F5',
            borderBottom: '1px solid #E4E9E5',
            fontSize: '0.78rem',
            letterSpacing: '0.035em',
            textTransform: 'uppercase',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#EEF1EE',
          paddingTop: 13,
          paddingBottom: 13,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#F8FAF8' },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 8,
          border: '1px solid #E9EDE9',
          boxShadow: '0 12px 30px rgba(28, 43, 39, 0.12)',
        },
      },
    },
  },
})
