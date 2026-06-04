import { createTheme } from '@mui/material/styles';

export const cmsTheme = createTheme({
  palette: {
    primary: {
      main: '#C05A34',
      light: '#ff8c5f',
      dark: '#8a2b0a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2c3e50',
      light: '#57687c',
      dark: '#1a252f',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#57687c',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '8px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.3s ease',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(192, 90, 52, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(192, 90, 52, 0.12)',
            },
          },
        },
      },
    },
  },
});