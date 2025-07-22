// src/pages/vendedores/form/index.tsx

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
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { Vendedor } from '../../types/Vendedor';
import { CobradorLookup } from '../../types/Cobrador';

interface VendedorFormData {
    id: number | null;
    nome: string;
    login: string;
    ativo: boolean;
    comissao: string;
    email: string;
    whatsapp: string;
    cobradorId: number | null;
}

const VendedorForm: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const [vendedorId, setVendedorId] = useState<number | null>(null);
    const [formData, setFormData] = useState<VendedorFormData>({
        id: null,
        nome: '',
        login: '',
        ativo: true,
        comissao: '',
        email: '',
        whatsapp: '',
        cobradorId: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [cobradores, setCobradores] = useState<CobradorLookup[]>([]);
    const [isCobradoresLoading, setIsCobradoresLoading] = useState(true);

    useEffect(() => {
        const fetchCobradores = async () => {
            if (!user?.token) {
                enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
                setIsCobradoresLoading(false);
                return;
            }

            try {
                const url = `https://multisorteios.dev/msrifaadmin/api/listarcobradoridlabel?token=${user.token}`;
                const response = await fetch(url);
                const result: { success: boolean; errorMessage?: string; data?: CobradorLookup[] } = await response.json();

                if (result.success && result.data) {
                    setCobradores(result.data);
                } else {
                    enqueueSnackbar(result.errorMessage || 'Erro ao carregar lista de cobradores.', { variant: 'error' });
                }
            } catch (error) {
                console.error('Erro ao buscar cobradores:', error);
                enqueueSnackbar('Não foi possível conectar ao servidor para buscar cobradores.', { variant: 'error' });
            } finally {
                setIsCobradoresLoading(false);
            }
        };

        fetchCobradores();

        if (id) {
            const vendedorIdNum = Number(id);
            if (isNaN(vendedorIdNum)) {
                enqueueSnackbar('ID de vendedor inválido.', { variant: 'error' });
                router.push('/vendedores');
                return;
            }
            setVendedorId(vendedorIdNum);

            const fetchVendedorById = async () => {
                if (!user?.token) {
                    enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                try {
                    const url = `https://multisorteios.dev/msrifaadmin/api/buscarvendedor?token=${user.token}&id=${vendedorIdNum}`;
                    const response = await fetch(url);
                    const result: { success: boolean; errorMessage?: string; data?: Vendedor } = await response.json();

                    if (result.success && result.data) {
                        const fetchedVendedor = result.data;
                        setFormData({
                            id: fetchedVendedor.id,
                            nome: fetchedVendedor.nome,
                            login: fetchedVendedor.login,
                            ativo: fetchedVendedor.ativo,
                            comissao: fetchedVendedor.comissao !== null ? fetchedVendedor.comissao.toString() : '',
                            email: fetchedVendedor.email || '',
                            whatsapp: fetchedVendedor.whatsapp || '',
                            cobradorId: fetchedVendedor.cobradorId || null,
                        });
                    } else {
                        enqueueSnackbar(result.errorMessage || 'Vendedor não encontrado ou erro ao carregar.', { variant: 'error' });
                        router.push('/vendedores');
                    }
                } catch (error) {
                    console.error('Erro ao buscar vendedor por ID:', error);
                    enqueueSnackbar('Não foi possível conectar ao servidor para buscar vendedor.', { variant: 'error' });
                    router.push('/vendedores');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchVendedorById();
        } else {
            setIsLoading(false);
            setVendedorId(null);
            setFormData(prev => ({ ...prev, id: null }));
        }
    }, [id, user?.token, enqueueSnackbar, router]);

    const handleCobradorChange = (event: any) => {
        setFormData(prev => ({
            ...prev,
            cobradorId: event.target.value as number,
        }));
    };

    // --- CORREÇÃO NESTA FUNÇÃO ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target; // Destructure name and value directly
        let fieldValue: string | boolean;

        // Conditionally determine the field value based on the input type
        if (e.target.type === 'checkbox') {
            fieldValue = (e.target as HTMLInputElement).checked; // Only access 'checked' if it's a checkbox
        } else {
            fieldValue = value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: fieldValue,
        }));
    };
    // --- FIM DA CORREÇÃO ---

    const handleClearField = (fieldName: keyof VendedorFormData) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldName === 'ativo' ? false : (fieldName === 'cobradorId' ? null : ''),
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

        const dataToSend = {
            id: formData.id,
            nome: formData.nome,
            login: formData.login,
            ativo: formData.ativo,
            comissao: formData.comissao !== '' ? parseFloat(formData.comissao) : null,
            whatsapp: formData.whatsapp.replace(/\D/g, ''),
            email: formData.email,
            cobradorId: formData.cobradorId,
        };

        const isEditing = vendedorId !== null;
        let url = '';
        let method = '';

        
            url = `https://multisorteios.dev/msrifaadmin/api/cadastrarvendedor?token=${user.token}`;
            method = 'POST';
        

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const result: { success: boolean; errorMessage?: string; data?: Vendedor } = await response.json();

            if (result.success) {
                enqueueSnackbar(`Vendedor ${isEditing ? 'atualizado' : 'criado'} com sucesso!`, { variant: 'success' });
                router.push('/vendedores');
            } else {
                enqueueSnackbar(result.errorMessage || `Erro ao ${isEditing ? 'atualizar' : 'criar'} vendedor.`, { variant: 'error' });
            }
        } catch (error) {
            console.error(`Erro ao ${isEditing ? 'enviar atualização' : 'criar'} vendedor:`, error);
            enqueueSnackbar('Não foi possível conectar ao servidor.', { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isCobradoresLoading) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <MuiCircularProgress />
                </Box>
            </Layout>
        );
    }

    const title = vendedorId ? 'Editar Vendedor' : 'Novo Vendedor';

    return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    {title}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/vendedores')}
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
                                        onChange={handleChange} // Este onChange agora está corrigido
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
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="cobrador-select-label">Cobrador</InputLabel>
                                <Select
                                    labelId="cobrador-select-label"
                                    id="cobrador-select"
                                    name="cobradorId"
                                    value={formData.cobradorId || ''}
                                    label="Cobrador"
                                    onChange={handleCobradorChange}
                                    disabled={isCobradoresLoading}
                                >
                                    <MenuItem value="">
                                        <em>Nenhum</em>
                                    </MenuItem>
                                    {cobradores.map((cobrador) => (
                                        <MenuItem key={cobrador.id} value={cobrador.id}>
                                            {cobrador.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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

export default VendedorForm;