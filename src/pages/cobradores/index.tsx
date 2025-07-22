// src/pages/cobradores/index.tsx (COM PAGINAÇÃO NO BACKEND)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../../components/layout/Layout';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress as MuiCircularProgress,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Switch,
    TableSortLabel,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    useTheme,
    TablePagination, // NOVO: Importar TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
// Certifique-se de que CobradorApiResponse em types/Cobrador.ts foi atualizado!
import { Cobrador, CobradorApiResponse } from '../../types/Cobrador';

// Definir tipos para ordenação
type Order = 'asc' | 'desc';
type HeadCellId = keyof Cobrador | 'actions';

interface HeadCell {
    id: HeadCellId;
    label: string;
    numeric: boolean;
    sortable: boolean;
    align?: 'left' | 'center' | 'right';
    filterable?: boolean;
    filterType?: 'text' | 'boolean' | 'number';
}

const headCells: HeadCell[] = [
    { id: 'id', label: 'ID', numeric: true, sortable: true, filterable: false },
    { id: 'nome', label: 'Nome', numeric: false, sortable: true, filterable: true, filterType: 'text' },
    { id: 'login', label: 'Login', numeric: false, sortable: true, filterable: true, filterType: 'text' },
    { id: 'ativo', label: 'Ativo', numeric: false, sortable: true, align: 'center', filterable: true, filterType: 'boolean' },
    { id: 'comissao', label: 'Comissão', numeric: true, sortable: true, filterable: true, filterType: 'number' },
    { id: 'email', label: 'Email', numeric: false, sortable: true, filterable: true, filterType: 'text' },
    { id: 'whatsapp', label: 'WhatsApp', numeric: false, sortable: true, filterable: true, filterType: 'text' },
    { id: 'actions', label: 'Ações', numeric: false, sortable: false, filterable: false, align: 'right' },
];

const CobradoresList: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    const [cobradores, setCobradores] = useState<Cobrador[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [cobradorToDelete, setCobradorToDelete] = useState<number | null>(null);

    // Estados de paginação
    const [page, setPage] = useState(0); // Página atual (0-indexed para Material-UI)
    const [rowsPerPage, setRowsPerPage] = useState(10); // Itens por página
    const [totalItems, setTotalItems] = useState(0); // Total de itens do backend

    // Estados de ordenação
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Cobrador>('id');

    // Estados de filtro
    const [filters, setFilters] = useState({
        nome: '',
        login: '',
        ativo: 'all',
        comissao: '',
        email: '',
        whatsapp: '',
    });

    const handleRequestSort = (property: keyof Cobrador) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(0); // Ao ordenar, volte para a primeira página
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement> | { target: { name?: string; value: unknown } }) => {
        const { name, value } = event.target;
        setFilters(prev => ({
            ...prev,
            [name as string]: value,
        }));
        setPage(0); // Ao filtrar, volte para a primeira página
    };

    const handleClearFilter = (filterName: keyof typeof filters) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: filterName === 'ativo' ? 'all' : '',
        }));
        setPage(0); // Ao limpar um filtro, volte para a primeira página
    };

    const handleClearAllFilters = () => {
        setFilters({
            nome: '',
            login: '',
            ativo: 'all',
            comissao: '',
            email: '',
            whatsapp: '',
        });
        setPage(0); // Ao limpar todos os filtros, volte para a primeira página
    };

    // NOVO: Funções de manipulação de paginação
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Volte para a primeira página ao mudar o número de itens por página
    };

    // ATUALIZADO: fetchCobradores para incluir paginação, ordenação e filtros para o backend
    const fetchCobradores = useCallback(async () => {
        if (!user?.token) {
            enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Construir URL com parâmetros de paginação, ordenação e filtros
            const params = new URLSearchParams();
            params.append('token', user.token);
            params.append('page', page.toString()); // Envia a página atual (0-indexed)
            params.append('size', rowsPerPage.toString()); // Envia o número de itens por página
            params.append('orderBy', orderBy as string); // Envia o campo de ordenação
            params.append('order', order); // Envia a direção da ordenação

            // Adicionar filtros ao URL (se existirem)
            if (filters.nome) params.append('nome', filters.nome);
            if (filters.login) params.append('login', filters.login);
            if (filters.ativo !== 'all') params.append('ativo', filters.ativo);
            if (filters.comissao) params.append('comissao', filters.comissao);
            if (filters.email) params.append('email', filters.email);
            if (filters.whatsapp) params.append('whatsapp', filters.whatsapp.replace(/\D/g, '')); // Enviar WhatsApp sem formatação

            const url = `https://multisorteios.dev/msrifaadmin/api/listarcobrador?${params.toString()}`;
            const response = await fetch(url);
            const result: CobradorApiResponse = await response.json();

            if (result.success && result.data) { // Verifique se result.data existe e tem a estrutura esperada
                setCobradores(result.data.content);
                setTotalItems(result.data.totalElements);
            } else {
                enqueueSnackbar(result.errorMessage || 'Erro ao carregar cobradores.', { variant: 'error' });
                setCobradores([]);
                setTotalItems(0);
            }
        } catch (error) {
            console.error('Erro ao buscar cobradores:', error);
            enqueueSnackbar('Não foi possível conectar ao servidor para listar cobradores.', { variant: 'error' });
            setCobradores([]);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    }, [user?.token, enqueueSnackbar, page, rowsPerPage, orderBy, order, filters]); // Dependências para refetch

    // O useEffect agora depende de page, rowsPerPage, orderBy, order e filters
    useEffect(() => {
        fetchCobradores();
    }, [fetchCobradores]);

    const handleEdit = (id: number) => {
        router.push(`/cobradores/form?id=${id}`);
    };

    const handleDeleteClick = (id: number) => {
        setCobradorToDelete(id);
        setOpenConfirmDialog(true);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setCobradorToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (cobradorToDelete === null || !user?.token) {
            return;
        }

        setIsDeleting(true);
        try {
            const url = `https://multisorteios.dev/msrifaadmin/api/excluircobrador?token=${user.token}&cobradorId=${cobradorToDelete}`;
            const response = await fetch(url, { method: 'GET' });
            const result: CobradorApiResponse = await response.json();

            if (result.success) {
                enqueueSnackbar('Cobrador excluído com sucesso!', { variant: 'success' });
                // Após a exclusão, force um re-fetch para atualizar a lista e a paginação
                // Pode ser necessário ajustar a página se o último item da página foi excluído
                const newTotalItems = totalItems - 1;
                const newTotalPages = Math.ceil(newTotalItems / rowsPerPage);
                if (page >= newTotalPages && page > 0) {
                    setPage(newTotalPages - 1); // Volta para a última página válida
                } else {
                    fetchCobradores(); // Re-fetch na página atual
                }
            } else {
                enqueueSnackbar(result.errorMessage || 'Erro ao excluir cobrador.', { variant: 'error' });
            }
        } catch (error) {
            console.error('Erro ao excluir cobrador:', error);
            enqueueSnackbar('Não foi possível conectar ao servidor para excluir cobrador.', { variant: 'error' });
        } finally {
            setIsDeleting(false);
            handleCloseConfirmDialog();
        }
    };

    const handleNewCobrador = () => {
        router.push('/cobradores/form');
    };

    // REMOVIDO: filteredAndSortedCobradores não é mais necessário, pois a API fará o trabalho
    // Apenas usamos os 'cobradores' diretamente, pois eles já vêm filtrados e ordenados
    // const filteredAndSortedCobradores = useMemo(() => { /* ... */ }, []);


    return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Cobradores
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={handleClearAllFilters}
                        sx={{ mr: 2 }}
                    >
                        Limpar Filtros
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleNewCobrador}
                    >
                        Novo Cobrador
                    </Button>
                </Box>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <MuiCircularProgress />
                </Box>
            ) : (
                <Paper> {/* Paper engloba a TableContainer e TablePagination */}
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="tabela de cobradores">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.align || (headCell.numeric ? 'right' : 'left')}
                                            padding="normal"
                                            sortDirection={orderBy === headCell.id ? order : false}
                                            sx={{ color: theme.palette.common.white }}
                                        >
                                            {headCell.sortable ? (
                                                <TableSortLabel
                                                    active={orderBy === headCell.id}
                                                    direction={orderBy === headCell.id ? order : 'asc'}
                                                    onClick={() => handleRequestSort(headCell.id as keyof Cobrador)}
                                                    sx={{
                                                        color: theme.palette.common.white,
                                                        '&.Mui-active': {
                                                            color: theme.palette.common.white,
                                                        },
                                                        '& .MuiTableSortLabel-icon': {
                                                            color: theme.palette.common.white,
                                                        },
                                                    }}
                                                >
                                                    {headCell.label}
                                                </TableSortLabel>
                                            ) : (
                                                headCell.label
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                {/* LINHA DOS FILTROS */}
                                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                                    {headCells.map((headCell) => (
                                        <TableCell key={`filter-${headCell.id}`}>
                                            {headCell.filterable && headCell.filterType === 'text' && (
                                                <TextField
                                                    variant="standard"
                                                    size="small"
                                                    placeholder={`Filtrar ${headCell.label}`}
                                                    name={headCell.id as string}
                                                    value={filters[headCell.id as keyof typeof filters]}
                                                    onChange={handleFilterChange}
                                                    fullWidth
                                                    InputProps={{
                                                        endAdornment: filters[headCell.id as keyof typeof filters] && (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    onClick={() => handleClearFilter(headCell.id as keyof typeof filters)}
                                                                    size="small"
                                                                >
                                                                    <ClearIcon fontSize="small" />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                        style: { fontSize: '0.85rem' }
                                                    }}
                                                    sx={{
                                                        '& .MuiInputBase-input': { paddingTop: '8px', paddingBottom: '8px' },
                                                        '& .MuiInputBase-root:before': { borderBottomColor: theme.palette.grey[400] },
                                                        '& .MuiInputBase-root:hover:not(.Mui-disabled):before': { borderBottomColor: theme.palette.primary.main },
                                                        '& .MuiInputBase-root:after': { borderBottomColor: theme.palette.primary.main },
                                                    }}
                                                />
                                            )}
                                            {headCell.filterable && headCell.filterType === 'boolean' && (
                                                <FormControl fullWidth size="small" variant="standard">
                                                    <Select
                                                        name={headCell.id as string}
                                                        value={filters.ativo}
                                                        onChange={handleFilterChange as (event: SelectChangeEvent<string>, child: React.ReactNode) => void}
                                                        displayEmpty
                                                        inputProps={{ 'aria-label': `Filtrar ${headCell.label}` }}
                                                        sx={{
                                                            fontSize: '0.85rem',
                                                            '& .MuiInputBase-input': { paddingTop: '8px', paddingBottom: '8px' },
                                                            '& .MuiInputBase-root:before': { borderBottomColor: theme.palette.grey[400] },
                                                            '& .MuiInputBase-root:hover:not(.Mui-disabled):before': { borderBottomColor: theme.palette.primary.main },
                                                            '& .MuiInputBase-root:after': { borderBottomColor: theme.palette.primary.main },
                                                        }}
                                                    >
                                                        <MenuItem value="all">Todos</MenuItem>
                                                        <MenuItem value="true">Ativos</MenuItem>
                                                        <MenuItem value="false">Inativos</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )}
                                            {headCell.filterable && headCell.filterType === 'number' && (
                                                <TextField
                                                    variant="standard"
                                                    size="small"
                                                    placeholder={`Filtrar ${headCell.label}`}
                                                    name={headCell.id as string}
                                                    value={filters[headCell.id as keyof typeof filters]}
                                                    onChange={handleFilterChange}
                                                    fullWidth
                                                    InputProps={{
                                                        endAdornment: filters[headCell.id as keyof typeof filters] && (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    onClick={() => handleClearFilter(headCell.id as keyof typeof filters)}
                                                                    size="small"
                                                                >
                                                                    <ClearIcon fontSize="small" />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                        style: { fontSize: '0.85rem' }
                                                    }}
                                                    sx={{
                                                        '& .MuiInputBase-input': { paddingTop: '8px', paddingBottom: '8px' },
                                                        '& .MuiInputBase-root:before': { borderBottomColor: theme.palette.grey[400] },
                                                        '& .MuiInputBase-root:hover:not(.Mui-disabled):before': { borderBottomColor: theme.palette.primary.main },
                                                        '& .MuiInputBase-root:after': { borderBottomColor: theme.palette.primary.main },
                                                    }}
                                                />
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cobradores.length === 0 && !isLoading ? ( // Verifica cobradores.length E !isLoading
                                    <TableRow>
                                        <TableCell colSpan={headCells.length} align="center">
                                            Nenhum cobrador encontrado com os filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cobradores.map((cobrador) => (
                                        <TableRow
                                            key={cobrador.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {cobrador.id}
                                            </TableCell>
                                            <TableCell>{cobrador.nome}</TableCell>
                                            <TableCell>{cobrador.login}</TableCell>
                                            <TableCell align="center">
                                                <Switch
                                                    checked={cobrador.ativo}
                                                    disabled
                                                    inputProps={{ 'aria-label': 'status ativo do cobrador' }}
                                                />
                                            </TableCell>
                                            <TableCell>{cobrador.comissao !== null ? `${cobrador.comissao}%` : ''}</TableCell>
                                            <TableCell>{cobrador.email || ''}</TableCell>
                                            <TableCell>{cobrador.whatsapp || ''}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    aria-label="editar"
                                                    onClick={() => handleEdit(cobrador.id)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="excluir"
                                                    onClick={() => handleDeleteClick(cobrador.id)}
                                                    color="error"
                                                    disabled={isDeleting}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {/* NOVO: Componente TablePagination */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={totalItems} // Total de itens do backend
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Itens por página:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                        }
                    />
                </Paper>
            )}

            <Dialog
                open={openConfirmDialog}
                onClose={handleCloseConfirmDialog}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
            >
                <DialogTitle id="confirm-dialog-title">Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                        Tem certeza de que deseja excluir este cobrador? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog} disabled={isDeleting}>Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeleting}>
                        {isDeleting ? <MuiCircularProgress size={24} /> : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default CobradoresList;