// src/pages/login.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Container, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext'; // Importe o hook useAuth

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, isAuthenticated, isLoading: authLoading } = useAuth(); // Renomeie isLoading para authLoading para evitar conflito
  const router = useRouter();

  // Se já estiver autenticado e não estiver carregando, redireciona para o dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null); // Limpa erros anteriores

    const success = await login({ login: email, password: password });

    if (success) {
      // Redirecionamento já ocorre dentro do AuthContext useEffect
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
    setLoading(false);
  };

  // Se ainda estiver carregando a autenticação inicial, exibe um spinner
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Admin MUI Login
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Login" // Mudado para "Login" conforme sua API
            name="login"
            autoComplete="login"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading} // Desabilita o botão enquanto carrega
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
          <Link href="#" passHref legacyBehavior>
            <Typography variant="body2" color="primary" sx={{ textAlign: 'center', mt: 2, cursor: 'pointer' }}>
              Esqueceu a senha?
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;