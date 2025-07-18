// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../styles/theme';
import { roboto } from '../styles/theme';
import { AuthProvider } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion'; // Importe motion e AnimatePresence
import { useRouter } from 'next/router'; // Importe useRouter

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter(); // Inicialize o router

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style jsx global>{`
        html {
          font-family: ${roboto.style.fontFamily};
        }
      `}</style>
      <AuthProvider>
        {/* AnimatePresence permite que os componentes saiam da tela com animação */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.pathname} // A chave é crucial para o Framer Motion detectar a mudança de rota
            initial={{ opacity: 0, y: 10 }} // Estado inicial (invisível, um pouco abaixo)
            animate={{ opacity: 1, y: 0 }} // Estado final (visível, na posição original)
            exit={{ opacity: 0, y: -10 }} // Estado de saída (invisível, um pouco acima)
            transition={{ duration: 0.2 }} // Duração da transição
            style={{ width: '100%', height: '100%' }} // Garante que a div ocupe o espaço
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;