// src/pages/cobradores/form/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/layout/Layout';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress as MuiCircularProgress,
    Switch,
    FormControlLabel,
    Paper,
    Grid,
    IconButton,
    InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { Cobrador } from '../../types/Cobrador'; // Certifique-se de que Cobrador está definido aqui

// Definir a interface para os dados do formulário
// comissao e whatsapp podem ser tratados como string no form para input flexível
interface CobradorFormData {
    nome: string;
    login: string;
    ativo: boolean;
    comissao: string; // Permitir string para input, converter para number ao enviar
    email: string;
    whatsapp: string;
}

const CobradorForm: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Obtém o ID do cobrador da URL
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const [cobradorId, setCobradorId] = useState<number | null>(null); // Para armazenar o ID numérico
    const [formData, setFormData] = useState<CobradorFormData>({
        nome: '',
        login: '',
        ativo: true, // Padrão para novo cobrador
        comissao: '',
        email: '',
        whatsapp: '',
    });
    const [isLoading, setIsLoading] = useState(true); // Indica se está carregando dados do cobrador existente
    const [isSaving, setIsSaving] = useState(false); // Indica se o formulário está sendo salvo

    // Effect para carregar os dados do cobrador se um ID for fornecido (modo edição)
    useEffect(() => {
        if (id) {
            const cobradorIdNum = Number(id);
            if (isNaN(cobradorIdNum)) {
                enqueueSnackbar('ID de cobrador inválido.', { variant: 'error' });
                router.push('/cobradores'); // Redireciona se o ID for inválido
                return;
            }
            setCobradorId(cobradorIdNum);

            const fetchCobradorById = async () => {
                if (!user?.token) {
                    enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                try {
                    // *** AQUI ESTÁ O AJUSTE PRINCIPAL ***
                    const url = `https://multisorteios.dev/msrifaadmin/api/buscarcobrador?token=${user.token}&id=${cobradorIdNum}`;
                    const response = await fetch(url);
                    // O tipo da resposta deve ser ajustado para o que o endpoint 'buscarcobrador' retorna
                    // Assumimos { success: boolean; errorMessage?: string; data?: Cobrador }
                    const result: { success: boolean; errorMessage?: string; data?: Cobrador } = await response.json();

                    if (result.success && result.data) {
                        const fetchedCobrador = result.data;
                        setFormData({
                            nome: fetchedCobrador.nome,
                            login: fetchedCobrador.login,
                            ativo: fetchedCobrador.ativo,
                            comissao: fetchedCobrador.comissao !== null ? fetchedCobrador.comissao.toString() : '',
                            email: fetchedCobrador.email || '',
                            whatsapp: fetchedCobrador.whatsapp || '',
                        });
                    } else {
                        enqueueSnackbar(result.errorMessage || 'Cobrador não encontrado ou erro ao carregar.', { variant: 'error' });
                        router.push('/cobradores'); // Redireciona se não encontrar ou houver erro
                    }
                } catch (error) {
                    console.error('Erro ao buscar cobrador por ID:', error);
                    enqueueSnackbar('Não foi possível conectar ao servidor para buscar cobrador.', { variant: 'error' });
                    router.push('/cobradores'); // Redireciona em caso de erro de conexão
                } finally {
                    setIsLoading(false);
                }
            };

            fetchCobradorById();
        } else {
            // Se não há ID na URL, é um novo cobrador, então não precisa carregar e já está pronto
            setIsLoading(false);
            setCobradorId(null);
        }
    }, [id, user?.token, enqueueSnackbar, router]); // Dependências do useEffect

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleClearField = (fieldName: keyof CobradorFormData) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldName === 'ativo' ? false : '', // Define valor padrão para ativo
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        if (!user?.token) {
            enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
            setIsSaving(false);
            return;
        }

        // Preparar os dados para envio
        const dataToSend = {
            ...formData,
            comissao: formData.comissao !== '' ? parseFloat(formData.comissao) : null,
            // Certifique-se de que o WhatsApp seja enviado apenas com dígitos se o backend esperar isso
            whatsapp: formData.whatsapp.replace(/\D/g, ''),
        };

        const isEditing = cobradorId !== null;
        let url = '';
        let method = '';

        if (isEditing) {
            url = `https://multisorteios.dev/msrifaadmin/api/atualizarCobrador?token=${user.token}&cobradorId=${cobradorId}`;
            method = 'PUT'; // Ou POST, dependendo da sua API para update
        } else {
            url = `https://multisorteios.dev/msrifaadmin/api/criarCobrador?token=${user.token}`;
            method = 'POST';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const result: { success: boolean; errorMessage?: string; data?: Cobrador } = await response.json();

            if (result.success) {
                enqueueSnackbar(`Cobrador ${isEditing ? 'atualizado' : 'criado'} com sucesso!`, { variant: 'success' });
                router.push('/cobradores'); // Redirecionar para a lista após sucesso
            } else {
                enqueueSnackbar(result.errorMessage || `Erro ao ${isEditing ? 'atualizar' : 'criar'} cobrador.`, { variant: 'error' });
            }
        } catch (error) {
            console.error(`Erro ao ${isEditing ? 'enviar atualização' : 'criar'} cobrador:`, error);
            enqueueSnackbar('Não foi possível conectar ao servidor.', { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <MuiCircularProgress />
                </Box>
            </Layout>
        );
    }

    const title = cobradorId ? 'Editar Cobrador' : 'Novo Cobrador';

    return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    {title}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/cobradores')}
                >
                    Voltar
                </Button>
            </Box>

            <Paper sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    endAdornment: formData.nome && (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleClearField('nome')} size="small">
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Login"
                                name="login"
                                value={formData.login}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    endAdornment: formData.login && (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleClearField('login')} size="small">
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.ativo}
                                        onChange={handleChange}
                                        name="ativo"
                                        color="primary"
                                    />
                                }
                                label="Ativo"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Comissão (%)"
                                name="comissao"
                                value={formData.comissao}
                                onChange={handleChange}
                                type="number"
                                inputProps={{ step: "0.01" }}
                                InputProps={{
                                    endAdornment: formData.comissao && (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleClearField('comissao')} size="small">
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                InputProps={{
                                    endAdornment: formData.email && (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleClearField('email')} size="small">
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="WhatsApp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                // Adapte a máscara de telefone se necessário
                                InputProps={{
                                    endAdornment: formData.whatsapp && (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleClearField('whatsapp')} size="small">
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={isSaving}
                        >
                            {isSaving ? <MuiCircularProgress size={24} /> : 'Salvar'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Layout>
    );
};

export default CobradorForm;