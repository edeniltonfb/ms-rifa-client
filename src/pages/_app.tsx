// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../styles/theme';
import { roboto } from '../styles/theme';
import { AuthProvider } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { SnackbarProvider } from 'notistack'; // <-- Importe SnackbarProvider

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    // <--- Envolva com SnackbarProvider ---
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <style jsx global>{`
          html {
            font-family: ${roboto.style.fontFamily};
          }
        `}</style>
        <AuthProvider>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={router.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%', height: '100%' }}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </AuthProvider>
      </ThemeProvider>
    </SnackbarProvider> // <-- Fechamento do SnackbarProvider
  );
}

export default MyApp;