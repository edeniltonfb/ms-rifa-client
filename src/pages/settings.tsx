// src/pages/settings.tsx
import React from 'react';
import Layout from '../components/layout/Layout';
import { Typography, Paper, Box, TextField, Button, CircularProgress } from '@mui/material';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const Settings: React.FC = () => {

  const { isAuthenticated, isLoading } = useAuthGuard();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!isAuthenticated) {
    return null;
  }
  return (
    <Layout>
      <Typography variant="h4" gutterBottom component="h1">
        Configurações
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Nome da Empresa"
            variant="outlined"
            fullWidth
            defaultValue="Minha Empresa S.A."
          />
          <TextField
            label="Email de Contato"
            variant="outlined"
            fullWidth
            type="email"
            defaultValue="contato@minhaempresa.com"
          />
          <TextField
            label="Fuso Horário"
            variant="outlined"
            fullWidth
            defaultValue="America/Sao_Paulo"
          />
          <Button variant="contained" color="primary" sx={{ mt: 2, alignSelf: 'flex-start' }}>
            Salvar Configurações
          </Button>
        </Box>
      </Paper>
    </Layout>
  );
};

export default Settings;