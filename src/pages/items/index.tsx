// src/pages/items/index.tsx
import React from 'react';
import Layout from '../../components/layout/Layout';
import { Typography, Paper, Box, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const Items: React.FC = () => {
  // Exemplo de dados
  const items = [
    { id: 1, name: 'Produto A', description: 'Descrição do Produto A' },
    { id: 2, name: 'Produto B', description: 'Descrição do Produto B' },
    { id: 3, name: 'Produto C', description: 'Descrição do Produto C' },
  ];

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
        Lista de Itens
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <List>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem>
                <ListItemText primary={item.name} secondary={item.description} />
              </ListItem>
              {index < items.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {items.length} itens.
          </Typography>
        </Box>
      </Paper>
    </Layout>
  );
};

export default Items;