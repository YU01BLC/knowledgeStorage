import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
          }
        : {
            background: {
              default: '#1e1e1e',
              paper: '#2a2a2a',
            },
          }),
    },
  });
