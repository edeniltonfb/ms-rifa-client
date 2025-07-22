// src/pages/vendedores/index.tsx (COM ESTRUTURA DE RESPOSTA DO BACKEND AJUSTADA)

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
    TablePagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { Vendedor, VendedorApiResponse } from '@/types/Vendedor';
// Certifique-se de que VendedorApiResponse em types/Vendedor.ts foi atualizado!

// Definir tipos para ordenação
type Order = 'asc' | 'desc';
type HeadCellId = keyof Vendedor | 'actions';

interface HeadCell {
    id: HeadCellId;
    label: string;
    numeric: boolean;
    sortable: boolean;
    align?: 'left' | 'center' | 'right';
    filterable?: boolean;
    filterType?: 'text' | 'boolean' | 'number';
    width?: number;
}

const headCells: HeadCell[] = [
    { id: 'id', label: 'ID', numeric: true, sortable: true, filterable: false },
    { id: 'nome', label: 'Nome', numeric: false, sortable: true, filterable: true, filterType: 'text' },
    { id: 'login', label: 'Login', numeric: false, sortable: true, filterable: true, filterType: 'text' },
    { id: 'ativo', label: 'Ativo', numeric: false, sortable: true, align: 'center', filterable: true, filterType: 'boolean' },
    { id: 'comissao', label: 'Comissão', numeric: true, sortable: true, filterable: true, filterType: 'number' },
    { id: 'email', label: 'Email', numeric: false, sortable: true, filterable: true, filterType: 'text' },
    { id: 'whatsapp', label: 'WhatsApp', numeric: false, sortable: true, filterable: true, filterType: 'text' },
    { id: 'actions', label: 'Ações', numeric: false, sortable: false, filterable: false, align: 'right', width: 100 },
];

const VendedoresList: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [vendedorToDelete, setVendedorToDelete] = useState<number | null>(null);

    // Estados de paginação
    const [page, setPage] = useState(0); // Página atual (0-indexed para Material-UI e Spring Boot Page)
    const [rowsPerPage, setRowsPerPage] = useState(10); // Itens por página
    const [totalItems, setTotalItems] = useState(0); // Total de itens do backend

    // Estados de ordenação
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Vendedor>('id');

    // Estados de filtro
    const [filters, setFilters] = useState({
        nome: '',
        login: '',
        ativo: 'all',
        comissao: '',
        email: '',
        whatsapp: '',
    });

    const handleRequestSort = (property: keyof Vendedor) => {
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

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Volte para a primeira página ao mudar o número de itens por página
    };

    const fetchVendedores = useCallback(async () => {
        if (!user?.token) {
            enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('token', user.token);
            params.append('page', page.toString());
            params.append('size', rowsPerPage.toString());
            params.append('orderBy', orderBy as string);
            params.append('order', order);

            if (filters.nome) params.append('nome', filters.nome);
            if (filters.login) params.append('login', filters.login);
            if (filters.ativo !== 'all') params.append('ativo', filters.ativo);
            if (filters.comissao) params.append('comissao', filters.comissao);
            if (filters.email) params.append('email', filters.email);
            if (filters.whatsapp) params.append('whatsapp', filters.whatsapp.replace(/\D/g, ''));

            const url = `https://multisorteios.dev/msrifaadmin/api/listarvendedor?${params.toString()}`;
            const response = await fetch(url);
            const result: VendedorApiResponse = await response.json();

            if (result.success && result.data) { // Verifique se result.data existe e tem a estrutura esperada
                // AJUSTE AQUI: Acessando as propriedades conforme a estrutura do seu backend
                setVendedores(result.data.content);
                setTotalItems(result.data.totalElements);
                // O Material-UI TablePagination usa 'page' 0-indexed, que corresponde a 'number' do Spring Page
                setPage(result.data.number);
                // O Material-UI TablePagination usa 'rowsPerPage', que corresponde a 'size' do Spring Page
                setRowsPerPage(result.data.size);

            } else {
                enqueueSnackbar(result.errorMessage || 'Erro ao carregar vendedores.', { variant: 'error' });
                setVendedores([]);
                setTotalItems(0);
            }
        } catch (error) {
            console.error('Erro ao buscar vendedores:', error);
            enqueueSnackbar('Não foi possível conectar ao servidor para listar vendedores.', { variant: 'error' });
            setVendedores([]);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    }, [user?.token, enqueueSnackbar, page, rowsPerPage, orderBy, order, filters]);

    useEffect(() => {
        fetchVendedores();
    }, [fetchVendedores]);

    const handleEdit = (id: number) => {
        router.push(`/vendedores/form?id=${id}`);
    };

    const handleDeleteClick = (id: number) => {
        setVendedorToDelete(id);
        setOpenConfirmDialog(true);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setVendedorToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (vendedorToDelete === null || !user?.token) {
            return;
        }

        setIsDeleting(true);
        try {
            const url = `https://multisorteios.dev/msrifaadmin/api/excluirvendedor?token=${user.token}&vendedorId=${vendedorToDelete}`;
            const response = await fetch(url, { method: 'GET' });
            const result: VendedorApiResponse = await response.json();

            if (result.success) {
                enqueueSnackbar('Vendedor excluído com sucesso!', { variant: 'success' });
                // Após a exclusão, force um re-fetch para atualizar a lista e a paginação
                // Ajuste a página se o último item da página foi excluído
                // A lógica de setPage(newTotalPages - 1) é importante para evitar páginas vazias
                const newTotalItems = totalItems - 1;
                const newTotalPages = Math.ceil(newTotalItems / rowsPerPage);
                if (page >= newTotalPages && page > 0) {
                    setPage(newTotalPages - 1);
                } else {
                    fetchVendedores();
                }
            } else {
                enqueueSnackbar(result.errorMessage || 'Erro ao excluir vendedor.', { variant: 'error' });
            }
        } catch (error) {
            console.error('Erro ao excluir vendedor:', error);
            enqueueSnackbar('Não foi possível conectar ao servidor para excluir vendedor.', { variant: 'error' });
        } finally {
            setIsDeleting(false);
            handleCloseConfirmDialog();
        }
    };

    const handleNewVendedor = () => {
        router.push('/vendedores/form');
    };

    return (
        <Layout>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2, // espaçamento entre título e botões
                    mb: 3,
                }}
            >
                <Typography variant="h4" component="h1">
                    Vendedores
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: { xs: 'flex-end', sm: 'flex-end' },
                        width: { xs: '100%', sm: 'auto' },
                        mt: { xs: 1, sm: 0 },
                    }}
                >
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
                        onClick={handleNewVendedor}
                    >
                        Novo Vendedor
                    </Button>
                </Box>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <MuiCircularProgress />
                </Box>
            ) : (
                <Paper>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ width: '100%', tableLayout: 'auto' }} aria-label="tabela de vendedores">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.align || (headCell.numeric ? 'right' : 'left')}
                                            padding="normal"
                                            sortDirection={orderBy === headCell.id ? order : false}
                                            sx={{
                                                width: headCell.width || 'auto',
                                                [theme.breakpoints.down('sm')]: {
                                                    fontSize: '1.5rem', // Ajuste conforme necessário
                                                },
                                                color: theme.palette.common.white,
                                                ...(headCell.id === 'comissao' || headCell.id === 'email' || headCell.id === 'whatsapp' ? {
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'none', // Oculta a célula em telas menores que 'sm'
                                                    },
                                                } : {}),

                                            }}
                                        >
                                            {headCell.sortable ? (
                                                <TableSortLabel
                                                    active={orderBy === headCell.id}
                                                    direction={orderBy === headCell.id ? order : 'asc'}
                                                    onClick={() => handleRequestSort(headCell.id as keyof Vendedor)}
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
                                        <TableCell key={`filter-${headCell.id}`}
                                            sx={{
                                                width: headCell.width || 'auto',
                                                [theme.breakpoints.down('sm')]: {
                                                    fontSize: '1.5rem', // Ajuste conforme necessário
                                                },
                                                color: theme.palette.common.white,
                                                ...(headCell.id === 'comissao' || headCell.id === 'email' || headCell.id === 'whatsapp' ? {
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'none', // Oculta a célula em telas menores que 'sm'
                                                    },
                                                } : {}),

                                            }}>
                                            {headCell.filterable && headCell.filterType === 'text' && (
                                                <TextField
                                                    variant="standard"
                                                    size="small"
                                                    placeholder={headCell.label}
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
                                                        [theme.breakpoints.down('sm')]: {
                                                            fontSize: '1.1rem', // Ajuste conforme necessário
                                                        },


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
                                                        inputProps={{ 'aria-label': headCell.label }}
                                                        sx={{
                                                            fontSize: '1.1rem',
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
                                                    placeholder={headCell.label}
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
                                                        style: { fontSize: '1.1rem' }
                                                    }}
                                                    sx={{
                                                        '& .MuiInputBase-input': { paddingTop: '8px', paddingBottom: '8px' },
                                                        '& .MuiInputBase-root:before': { borderBottomColor: theme.palette.grey[400] },
                                                        '& .MuiInputBase-root:hover:not(.Mui-disabled):before': { borderBottomColor: theme.palette.primary.main },
                                                        '& .MuiInputBase-root:after': { borderBottomColor: theme.palette.primary.main },

                                                        [theme.breakpoints.down('sm')]: {
                                                            display: 'none',
                                                        },

                                                    }}

                                                />
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vendedores.length === 0 && !isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={headCells.length} align="center">
                                            Nenhum vendedor encontrado com os filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vendedores.map((vendedor) => (
                                        <TableRow
                                            key={vendedor.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row" sx={{
                                                [theme.breakpoints.down('sm')]: {
                                                    fontSize: '1.5rem',
                                                },
                                            }}>
                                                {vendedor.id}
                                            </TableCell>
                                            <TableCell sx={{
                                                [theme.breakpoints.down('sm')]: {
                                                    fontSize: '1.5rem',
                                                },
                                            }}>{vendedor.nome}</TableCell>
                                            <TableCell sx={{
                                                [theme.breakpoints.down('sm')]: {
                                                    fontSize: '1.5rem',
                                                },
                                            }}>{vendedor.login}</TableCell>
                                            <TableCell align="center" sx={{
                                                [theme.breakpoints.down('sm')]: {
                                                    fontSize: '1.5rem',
                                                },
                                            }}>
                                                <Switch
                                                    checked={vendedor.ativo}
                                                    disabled
                                                    inputProps={{ 'aria-label': 'status ativo do vendedor' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'none', // Oculta a célula em telas menores que 'sm'
                                                },
                                            }}>{vendedor.comissao !== null ? `${vendedor.comissao}%` : ''}</TableCell>
                                            <TableCell sx={{
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'none', // Oculta a célula em telas menores que 'sm'
                                                },
                                            }}>{vendedor.email || ''}</TableCell>
                                            <TableCell sx={{
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'none', // Oculta a célula em telas menores que 'sm'
                                                },
                                            }}>{vendedor.whatsapp || ''}</TableCell>
                                            <TableCell align="right" sx={{
                                                [theme.breakpoints.down('sm')]: {
                                                    paddingLeft: '4px',
                                                    paddingRight: '4px',
                                                },
                                            }}>
                                                <IconButton
                                                    aria-label="editar"
                                                    onClick={() => handleEdit(vendedor.id)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="excluir"
                                                    onClick={() => handleDeleteClick(vendedor.id)}
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
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={totalItems}
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
                        Tem certeza de que deseja excluir este vendedor? Esta ação não pode ser desfeita.
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

export default VendedoresList;