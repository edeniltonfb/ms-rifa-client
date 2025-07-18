// src/pages/index.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Typography, Grid, Paper, Box, Button, CircularProgress, Alert, Chip } from '@mui/material'; // Adicionado Chip e Alert
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useAuth } from '../context/AuthContext'; // Importe useAuth para pegar o token
import { motion } from 'framer-motion';

// 1. Definir Tipos de Dados da API
interface Empresa {
  empresaId: number;
  empresaNome: string;
}

interface Rifa {
  modalidadeVenda: string;
  dataSorteio: string; // Formato "DD/MM/YYYY"
  empresaId: number;
}

interface DashboardData {
  empresaList: Empresa[];
  rifaHojeList: Rifa[];
  rifaPassadaList: Rifa[];
  rifaFuturaList: Rifa[];
}

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const { user } = useAuth(); // Obtenha o usuário (e o token) do contexto de autenticação

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Estado para os IDs das empresas selecionadas (todos marcados inicialmente)
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);

  // 2. Buscar Dados da API
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.token) { // Garante que o token existe antes de buscar
        setDataError('Token de autenticação não encontrado.');
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      setDataError(null);

      try {
        const response = await fetch(`https://multisorteios.dev/msrifaadmin/api/dashboard?token=${user.token}`);
        const result = await response.json();

        if (result.success && result.data) {
          setDashboardData(result.data);
          // Inicialmente, todas as empresas devem estar marcadas
          setSelectedCompanyIds(result.data.empresaList.map((emp: Empresa) => emp.empresaId));
        } else {
          setDataError(result.errorMessage || 'Erro ao carregar dados do dashboard.');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        setDataError('Não foi possível conectar ao servidor do dashboard.');
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchDashboardData();
    }
  }, [authLoading, isAuthenticated, user?.token]); // Dependências do useEffect

  // 3. Lógica para alternar o estado do botão da empresa
  const handleCompanyToggle = (companyId: number) => {
    setSelectedCompanyIds(prev => {
      if (prev.includes(companyId)) {
        // Se já estiver selecionado, remove
        return prev.filter(id => id !== companyId);
      } else {
        // Se não estiver selecionado, adiciona
        return [...prev, companyId];
      }
    });
  };

  // Funções para filtrar as rifas com base nas empresas selecionadas
  const filterRifas = (rifaList: Rifa[]) => {
    if (selectedCompanyIds.length === 0) {
      return []; // Se nenhuma empresa estiver selecionada, não exibe rifas
    }
    return rifaList.filter(rifa => selectedCompanyIds.includes(rifa.empresaId));
  };

  // Mapear empresaId para empresaNome para exibição
  const getEmpresaNome = (empresaId: number) => {
    return dashboardData?.empresaList.find(emp => emp.empresaId === empresaId)?.empresaNome || 'Empresa Desconhecida';
  };

  // Estados de carregamento e erro iniciais (do AuthGuard)
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null; // O hook já redireciona
  }

  // Estados de carregamento e erro dos dados do dashboard
  if (dataLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (dataError) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mt: 2 }}>{dataError}</Alert>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <Alert severity="info" sx={{ mt: 2 }}>Nenhum dado de dashboard disponível.</Alert>
      </Layout>
    );
  }

  // Conteúdo principal do Dashboard
  return (
    <Layout>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard
      </Typography>

      {/* Linha de Botões de Empresa */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {dashboardData.empresaList.map((empresa) => (
          <motion.div key={empresa.empresaId} whileTap={{ scale: 0.95 }}>
            <Chip
              label={empresa.empresaNome}
              onClick={() => handleCompanyToggle(empresa.empresaId)}
              color={selectedCompanyIds.includes(empresa.empresaId) ? 'primary' : 'default'}
              variant={selectedCompanyIds.includes(empresa.empresaId) ? 'filled' : 'outlined'}
              clickable
              sx={{
                cursor: 'pointer',
                transition: 'background-color 0.2s, color 0.2s',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            />
          </motion.div>
        ))}
      </Box>

      {/* Painéis de Rifas */}
      <Grid container spacing={3}>
        {/* Painel de Rifas de Hoje */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Rifas de Hoje</Typography>
            <Grid container spacing={2}>
              {filterRifas(dashboardData.rifaHojeList).length > 0 ? (
                filterRifas(dashboardData.rifaHojeList).map((rifa, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`hoje-${index}`}>
                    <Paper elevation={2} sx={{ p: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                      <Typography variant="subtitle1" fontWeight="bold">{rifa.modalidadeVenda}</Typography>
                      <Typography variant="body2" color="text.secondary">Data Sorteio: {rifa.dataSorteio}</Typography>
                      <Typography variant="body2" color="text.secondary">Empresa: {getEmpresaNome(rifa.empresaId)}</Typography>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Nenhuma rifa de hoje para as empresas selecionadas.</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Painel de Rifas Futuras */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Rifas Futuras</Typography>
            <Grid container spacing={2}>
              {filterRifas(dashboardData.rifaFuturaList).length > 0 ? (
                filterRifas(dashboardData.rifaFuturaList).map((rifa, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`futura-${index}`}>
                    <Paper elevation={2} sx={{ p: 2, borderLeft: '4px solid', borderColor: 'info.main' }}>
                      <Typography variant="subtitle1" fontWeight="bold">{rifa.modalidadeVenda}</Typography>
                      <Typography variant="body2" color="text.secondary">Data Sorteio: {rifa.dataSorteio}</Typography>
                      <Typography variant="body2" color="text.secondary">Empresa: {getEmpresaNome(rifa.empresaId)}</Typography>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Nenhuma rifa futura para as empresas selecionadas.</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Painel de Rifas Passadas */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Rifas Passadas</Typography>
            <Grid container spacing={2}>
              {filterRifas(dashboardData.rifaPassadaList).length > 0 ? (
                filterRifas(dashboardData.rifaPassadaList).map((rifa, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`passada-${index}`}>
                    <Paper elevation={2} sx={{ p: 2, borderLeft: '4px solid', borderColor: 'warning.main' }}>
                      <Typography variant="subtitle1" fontWeight="bold">{rifa.modalidadeVenda}</Typography>
                      <Typography variant="body2" color="text.secondary">Data Sorteio: {rifa.dataSorteio}</Typography>
                      <Typography variant="body2" color="text.secondary">Empresa: {getEmpresaNome(rifa.empresaId)}</Typography>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Nenhuma rifa passada para as empresas selecionadas.</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;