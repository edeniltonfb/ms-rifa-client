// src/styles/theme.ts
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

// Carregando a fonte Roboto do Google Fonts
export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Azul padrão do Material Design
    },
    secondary: {
      main: '#dc004e', // Vermelho/Rosa para acentos
    },
    // Você pode adicionar mais cores aqui (sucess, warning, info, error)
  },
  typography: {
    fontFamily: roboto.style.fontFamily, // Usando a fonte Roboto carregada
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Remove a sombra padrão para um look mais flat Material 3
      },
      styleOverrides: {
        root: {
          borderRadius: 8, // Borda arredondada
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 2, // Elevação padrão para cards
      },
      styleOverrides: {
        root: {
          borderRadius: 12, // Borda mais arredondada para cards
        },
      },
    },
    // Adicione mais customizações de componentes aqui se desejar
  },
});

export default theme;