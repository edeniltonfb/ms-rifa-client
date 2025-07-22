// src/pages/cobradores/form.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/layout/Layout';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    FormControlLabel,
    Switch,
    CircularProgress as MuiCircularProgress,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { Cobrador, CobradorApiResponse } from '../../types/Cobrador';

const CobradorForm: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Pega o ID da URL se estiver em modo de edição
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const [cobrador, setCobrador] = useState<Cobrador>({
        id: 0, // Será 0 para novos, ou o ID existente para edição
        nome: '',
        ativo: true,
        login: '',
        comissao: null,
        email: '',
        whatsapp: '',
    });
    const [isLoading, setIsLoading] = useState(false); // Para carregar dados de edição
    const [isSubmitting, setIsSubmitting] = useState(false); // Para submeter o formulário

    // Estados para controle de erros de validação
    const [errors, setErrors] = useState({
        nome: '',
        login: '',
        comissao: '',
    });

    const isEditMode = !!id; // Verdadeiro se um ID for passado na URL

    // Função para buscar os dados do cobrador para edição
    const fetchCobrador = useCallback(async (cobradorId: number) => {
        if (!user?.token) {
            enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const url = `https://multisorteios.dev/msrifaadmin/api/listarcobrador?token=${user.token}`;
            const response = await fetch(url);
            const result: CobradorApiResponse = await response.json();

            if (result.success && Array.isArray(result.data)) {
                const foundCobrador = (result.data as Cobrador[]).find(c => c.id === cobradorId);
                if (foundCobrador) {
                    setCobrador(foundCobrador);
                } else {
                    enqueueSnackbar('Cobrador não encontrado.', { variant: 'error' });
                    router.push('/cobradores'); // Volta para a lista se não encontrar
                }
            } else {
                enqueueSnackbar(result.errorMessage || 'Erro ao carregar dados do cobrador.', { variant: 'error' });
                router.push('/cobradores');
            }
        } catch (error) {
            console.error('Erro ao buscar cobrador:', error);
            enqueueSnackbar('Não foi possível conectar ao servidor para carregar o cobrador.', { variant: 'error' });
            router.push('/cobradores');
        } finally {
            setIsLoading(false);
        }
    }, [user?.token, enqueueSnackbar, router]);

    useEffect(() => {
        if (isEditMode && id && typeof id === 'string') {
            fetchCobrador(parseInt(id, 10));
        } else if (!isEditMode) {
            // Limpa o formulário se estiver em modo de criação
            setCobrador({
                id: 0,
                nome: '',
                ativo: true,
                login: '',
                comissao: null,
                email: '',
                whatsapp: '',
            });
        }
    }, [isEditMode, id, fetchCobrador]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setCobrador(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Limpa o erro ao digitar
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleComissaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        // Permite vazio para o campo se a API aceitar null
        if (value === '') {
            setCobrador(prev => ({ ...prev, comissao: null }));
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
                setCobrador(prev => ({ ...prev, comissao: numValue }));
            } else {
                // Se não for um número válido, ainda assim atualiza o estado para permitir backspace etc.
                setCobrador(prev => ({ ...prev, comissao: value as any })); // Temporariamente para permitir visualização
            }
        }
        setErrors(prev => ({ ...prev, comissao: '' }));
    };

    const validateForm = () => {
        let isValid = true;
        let newErrors = { nome: '', login: '', comissao: '' };

        if (!cobrador.nome.trim()) {
            newErrors.nome = 'O nome é obrigatório.';
            isValid = false;
        }
        if (!cobrador.login.trim()) {
            newErrors.login = 'O login é obrigatório.';
            isValid = false;
        }
        // Validação da comissão
        if (cobrador.comissao !== null) {
            const comissaoNum = Number(cobrador.comissao); // Usa Number para lidar com string se ainda não convertido
            if (isNaN(comissaoNum) || comissaoNum < 0 || comissaoNum > 40) {
                newErrors.comissao = 'A comissão deve ser um número entre 0 e 40.';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            enqueueSnackbar('Por favor, corrija os erros no formulário.', { variant: 'warning' });
            return;
        }

        if (!user?.token) {
            enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
            return;
        }

        setIsSubmitting(true);

        // Prepara o payload
        const payload: Partial<Cobrador> = {
            nome: cobrador.nome,
            ativo: cobrador.ativo,
            login: cobrador.login,
            comissao: cobrador.comissao,
            email: cobrador.email,
            whatsapp: cobrador.whatsapp,
        };

        // Adiciona o ID ao payload se estiver em modo de edição
        if (isEditMode && typeof id === 'string') {
            payload.id = parseInt(id, 10);
        }

        try {
            const url = `https://multisorteios.dev/msrifaadmin/api/cadastrarcobrador?token=${user.token}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result: CobradorApiResponse = await response.json();

            if (result.success) {
                enqueueSnackbar(`Cobrador ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`, { variant: 'success' });
                router.push('/cobradores'); // Redireciona de volta para a lista
            } else {
                enqueueSnackbar(result.errorMessage || `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} cobrador.`, { variant: 'error' });
            }
        } catch (error) {
            console.error(`Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} cobrador:`, error);
            enqueueSnackbar(`Não foi possível conectar ao servidor para ${isEditMode ? 'atualizar' : 'cadastrar'} cobrador.`, { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && isEditMode) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <MuiCircularProgress />
                    <Typography ml={2}>Carregando dados do cobrador...</Typography>
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    {isEditMode ? 'Editar Cobrador' : 'Novo Cobrador'}
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => router.push('/cobradores')}
                    disabled={isSubmitting}
                >
                    Voltar para a Lista
                </Button>
            </Box>

            <Paper sx={{ p: 4, mt: 3 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Nome"
                        name="nome"
                        value={cobrador.nome}
                        onChange={handleChange}
                        margin="normal"
                        required
                        error={!!errors.nome}
                        helperText={errors.nome}
                    />
                    <TextField
                        fullWidth
                        label="Login"
                        name="login"
                        value={cobrador.login}
                        onChange={handleChange}
                        margin="normal"
                        required
                        error={!!errors.login}
                        helperText={errors.login}
                    />
                    <TextField
                        fullWidth
                        label="Comissão (%)"
                        name="comissao"
                        type="number"
                        value={cobrador.comissao === null ? '' : cobrador.comissao} // Exibe vazio se for null
                        onChange={handleComissaoChange}
                        margin="normal"
                        inputProps={{ min: 0, max: 40 }}
                        error={!!errors.comissao}
                        helperText={errors.comissao || 'Valor entre 0 e 40.'}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={cobrador.email}
                        onChange={handleChange}
                        margin="normal"
                        type="email"
                    />
                    <TextField
                        fullWidth
                        label="WhatsApp"
                        name="whatsapp"
                        value={cobrador.whatsapp}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={cobrador.ativo}
                                onChange={handleChange}
                                name="ativo"
                                color="primary"
                            />
                        }
                        label="Ativo"
                        sx={{ mt: 2 }}
                    />
                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <MuiCircularProgress size={24} /> : (isEditMode ? 'Salvar Alterações' : 'Cadastrar')}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => router.push('/cobradores')}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Layout>
    );
};

export default CobradorForm;