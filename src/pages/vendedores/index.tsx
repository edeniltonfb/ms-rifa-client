// src/pages/vendedores/index.tsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // Importar useRef
import Layout from '../../components/layout/Layout';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Paper,
    IconButton,
    CircularProgress as MuiCircularProgress,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Switch,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TableSortLabel,
    Grid,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { Vendedor } from '../../types/Vendedor';
import { CobradorLookup } from '../../types/Cobrador';

interface HeadCell {
    id: keyof Vendedor | 'actions';
    label: string;
    numeric: boolean;
    sortable: boolean;
    filterable: boolean;
    align?: 'left' | 'center' | 'right';
    filterType?: 'text' | 'boolean' | 'number' | 'select';
    options?: CobradorLookup[];
}

type Order = 'asc' | 'desc';

interface PaginatedResponseData {
    content: Vendedor[];
    totalElements: number;
}

interface ApiResponse {
    success: boolean;
    errorMessage: string | null;
    data: PaginatedResponseData;
}


const VendedoresList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Vendedor>('nome');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [vendedorToDeleteId, setVendedorToDeleteId] = useState<number | null>(null);

    const [filters, setFilters] = useState({
        nome: '',
        login: '',
        ativo: '', // Valor padrão vazio significa "Todos"
        comissao: '',
        email: '',
        whatsapp: '',
        cobradorId: ''
    });

    // useRef para manter a referência mais recente dos filtros
    const filtersRef = useRef(filters);
    // useEffect para manter filtersRef.current atualizado sempre que filters mudar
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Novo estado para forçar a busca explicitamente
    const [forceFetchTimestamp, setForceFetchTimestamp] = useState(0);


    const [cobradoresParaFiltro, setCobradoresParaFiltro] = useState<CobradorLookup[]>([]);
    const [isCobradoresLoading, setIsCobradoresLoading] = useState(true);

    const headCells: HeadCell[] = useMemo(() => [
        { id: 'id', label: 'ID', numeric: true, sortable: true, filterable: false, align: 'right' },
        { id: 'nome', label: 'Nome', numeric: false, sortable: true, filterable: true, filterType: 'text' },
        { id: 'login', label: 'Login', numeric: false, sortable: true, filterable: true, filterType: 'text' },
        { id: 'ativo', label: 'Ativo', numeric: false, sortable: true, filterable: true, filterType: 'boolean', align: 'center' },
        { id: 'comissao', label: 'Comissão', numeric: true, sortable: true, filterable: true, filterType: 'number' },
        { id: 'email', label: 'Email', numeric: false, sortable: true, filterable: true, filterType: 'text' },
        { id: 'whatsapp', label: 'WhatsApp', numeric: false, sortable: true, filterable: true, filterType: 'text' },
        { id: 'cobradorNome', label: 'Cobrador', numeric: false, sortable: true, filterable: true, filterType: 'select', options: cobradoresParaFiltro },
        { id: 'actions', label: 'Ações', numeric: false, sortable: false, filterable: false, align: 'right' },
    ], [cobradoresParaFiltro]);

    const fetchVendedores = useCallback(async () => {
        if (!user?.token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Usa o filtersRef.current para obter o estado mais recente dos filtros
            const currentFilters = filtersRef.current;
            
            const params: { [key: string]: string } = {
                token: user.token,
                page: page.toString(),
                size: rowsPerPage.toString(),
                orderBy:orderBy,
                order: order
            };

            for (const key in currentFilters) {
                const value = currentFilters[key as keyof typeof currentFilters];
                if (value !== '' && (key !== 'ativo' || (key === 'ativo' && value !== 'all'))) {
                    params[key] = value;
                }
            }
            
            const queryParams = new URLSearchParams(params).toString();
            const url = `https://multisorteios.dev/msrifaadmin/api/listarvendedor?${queryParams}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errorMessage || 'Erro ao carregar vendedores.');
            }

            const result: ApiResponse = await response.json();

            if (result.success && result.data) {
                if (Array.isArray(result.data.content)) {
                    setVendedores(result.data.content);
                    setTotalRows(result.data.totalElements);
                } else {
                    console.error("API 'listarvendedor' retornou 'content' que não é um array:", result.data.content);
                    enqueueSnackbar('Formato de dados de vendedores inválido. Contate o suporte.', { variant: 'error' });
                    setVendedores([]);
                    setTotalRows(0);
                }
            } else {
                enqueueSnackbar(result.errorMessage || 'Erro ao carregar vendedores.', { variant: 'error' });
                setVendedores([]);
                setTotalRows(0);
            }
        } catch (error: any) {
            console.error('Erro ao buscar vendedores:', error);
            enqueueSnackbar(error.message || 'Não foi possível conectar ao servidor para buscar vendedores.', { variant: 'error' });
            setVendedores([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, rowsPerPage, orderBy, order, user?.token, enqueueSnackbar]); // REMOVIDO: filters das dependências

    const fetchCobradoresParaFiltro = useCallback(async () => {
        if (!user?.token) {
            setIsCobradoresLoading(false);
            return;
        }

        try {
            const url = `https://multisorteios.dev/msrifaadmin/api/listarcobradoridlabel?token=${user.token}`;
            const response = await fetch(url);
            const result: { success: boolean; errorMessage?: string; data?: CobradorLookup[] } = await response.json();

            if (result.success && result.data) {
                if (Array.isArray(result.data)) {
                    setCobradoresParaFiltro(result.data);
                } else {
                    console.error("API 'listarcobradoridlabel' retornou dados que não são um array:", result.data);
                    enqueueSnackbar('Formato de dados de cobradores inválido para filtro. Contate o suporte.', { variant: 'error' });
                    setCobradoresParaFiltro([]);
                }
            } else {
                enqueueSnackbar(result.errorMessage || 'Erro ao carregar lista de cobradores para filtro.', { variant: 'error' });
                setCobradoresParaFiltro([]);
            }
        } catch (error) {
            console.error('Erro ao buscar cobradores para filtro:', error);
            enqueueSnackbar('Não foi possível conectar ao servidor para buscar cobradores para filtro.', { variant: 'error' });
            setCobradoresParaFiltro([]);
        } finally {
            setIsCobradoresLoading(false);
        }
    }, [user?.token, enqueueSnackbar]);

    // O useEffect agora depende de forceFetchTimestamp para disparar a busca por filtros
    // e de fetchVendedores (que muda quando page, rowsPerPage, orderBy, order mudam)
    useEffect(() => {
        fetchVendedores();
    }, [fetchVendedores, forceFetchTimestamp]);

    useEffect(() => {
        fetchCobradoresParaFiltro();
    }, [fetchCobradoresParaFiltro]);


    const handleRequestSort = (property: keyof Vendedor) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(0); // Reset page on sort
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Este handler SÓ atualiza o estado dos filtros, sem disparar a busca
    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement> | { target: { name?: string; value: unknown } }) => {
        const { name, value } = event.target;
        setFilters(prev => ({
            ...prev,
            [name as string]: value,
        }));
    };

    // Handler para o botão "Pesquisar" - dispara a busca
    const handleSearch = () => {
        setPage(0); // Garante que a pesquisa sempre começa da primeira página
        setForceFetchTimestamp(Date.now()); // Força o useEffect a rodar
    };

    // Handler para limpar um filtro individual - NÃO dispara a busca
    const handleClearFilter = (filterName: keyof typeof filters) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: '',
        }));
    };

    // Handler para limpar todos os filtros - dispara a busca
      const handleClearAllFilters = () => {
        setFilters({
            nome: '',
            login: '',
            ativo: '',
            comissao: '',
            email: '',
            whatsapp: '',
            cobradorId:'',
        });
        setPage(0); // A mudança de página disparará o fetchVendedores
        setForceFetchTimestamp(Date.now()); // Força o useEffect a rodar
    };

    const handleAddVendedor = () => {
        router.push('/vendedores/form');
    };

    const handleEditVendedor = (id: number) => {
        router.push(`/vendedores/form?id=${id}`);
    };

    const handleDeleteClick = (id: number) => {
        setVendedorToDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setVendedorToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        if (!vendedorToDeleteId || !user?.token) {
            enqueueSnackbar('ID do vendedor não especificado ou token de autenticação ausente.', { variant: 'error' });
            return;
        }

        setIsDeleting(true);
        try {
            const url = `https://multisorteios.dev/msrifaadmin/api/deletarvendedor?token=${user.token}&id=${vendedorToDeleteId}`;
            const response = await fetch(url, { method: 'DELETE' });
            const result: { success: boolean; errorMessage?: string } = await response.json();

            if (result.success) {
                enqueueSnackbar('Vendedor excluído com sucesso!', { variant: 'success' });
                setForceFetchTimestamp(Date.now()); // Força o useEffect a rodar após a exclusão
                handleCloseDeleteConfirm();
            } else {
                enqueueSnackbar(result.errorMessage || 'Erro ao excluir vendedor.', { variant: 'error' });
            }
        } catch (error) {
            console.error('Erro ao excluir vendedor:', error);
            enqueueSnackbar('Não foi possível conectar ao servidor para excluir vendedor.', { variant: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Layout>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
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
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddVendedor}
                    >
                        Novo Vendedor
                    </Button>
                </Box>
            </Box>

            {/* Novo formulário de filtros */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Filtrar Vendedores</Typography>
                <Grid container spacing={2}>
                    {headCells.filter(cell => cell.filterable).map((headCell) => (
                        <Grid item xs={12} sm={6} md={3} key={`filter-form-${headCell.id}`}>
                            {headCell.filterType === 'text' && (
                                <TextField
                                    fullWidth
                                    label={headCell.label}
                                    name={headCell.id as string}
                                    value={filters[headCell.id as keyof typeof filters]}
                                    onChange={handleFilterChange}
                                    InputProps={{
                                        endAdornment: filters[headCell.id as keyof typeof filters] && (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleClearFilter(headCell.id as keyof typeof filters)} size="small">
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                            {headCell.filterType === 'boolean' && (
                                <FormControl fullWidth>
                                    <InputLabel>{headCell.label}</InputLabel>
                                    <Select
                                        name={headCell.id as string}
                                        value={filters[headCell.id as keyof typeof filters]}
                                        onChange={handleFilterChange}
                                        label={headCell.label}
                                    >
                                        <MenuItem value="">
                                            <em>Todos</em>
                                        </MenuItem>
                                        <MenuItem value="true">Ativo</MenuItem>
                                        <MenuItem value="false">Inativo</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                            {headCell.filterType === 'number' && (
                                <TextField
                                    fullWidth
                                    label={headCell.label}
                                    name={headCell.id as string}
                                    value={filters[headCell.id as keyof typeof filters]}
                                    onChange={handleFilterChange}
                                    type="number"
                                    InputProps={{
                                        endAdornment: filters[headCell.id as keyof typeof filters] && (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleClearFilter(headCell.id as keyof typeof filters)} size="small">
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                            {headCell.filterType === 'select' && headCell.id === 'cobradorNome' && (
                                <FormControl fullWidth>
                                    <InputLabel>Cobrador</InputLabel>
                                    <Select
                                        name="cobradorId"
                                        value={filters.cobradorId}
                                        onChange={handleFilterChange}
                                        label="Cobrador"
                                        disabled={isCobradoresLoading}
                                    >
                                        <MenuItem value="">
                                            <em>Todos</em>
                                        </MenuItem>
                                        {cobradoresParaFiltro.map((cobrador) => (
                                            <MenuItem key={cobrador.id} value={cobrador.id}>
                                                {cobrador.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                    >
                        Pesquisar
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={handleClearAllFilters}
                    >
                        Limpar Todos os Filtros
                    </Button>
                </Box>
            </Paper>

            {(isLoading || isCobradoresLoading) && vendedores.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <MuiCircularProgress />
                </Box>
            ) : (
                <Paper>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="tabela de vendedores">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.align || (headCell.numeric ? 'right' : 'left')}
                                            padding="normal"
                                            sortDirection={orderBy === headCell.id ? order : false}
                                            sx={{
                                                [theme.breakpoints.down('sm')]: {
                                                    fontSize: '1.5rem',
                                                },
                                                color: theme.palette.common.white,
                                                ...(headCell.id === 'comissao' || headCell.id === 'email' || headCell.id === 'whatsapp' || headCell.id === 'cobradorNome'? {
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'none',
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
                            </TableHead>
                            <TableBody>
                                {vendedores.length === 0 && !isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={headCells.length} align="center">
                                            Nenhum vendedor encontrado com os filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    Array.isArray(vendedores) && vendedores.map((vendedor) => (
                                        <TableRow
                                            key={vendedor.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                                align="right"
                                                sx={{ [theme.breakpoints.down('sm')]: { fontSize: '0.85rem' } }}
                                            >
                                                {vendedor.id}
                                            </TableCell>
                                            <TableCell sx={{ [theme.breakpoints.down('sm')]: { fontSize: '0.85rem' } }}>
                                                {vendedor.nome}
                                            </TableCell>
                                            <TableCell sx={{ [theme.breakpoints.down('sm')]: { fontSize: '0.85rem' } }}>
                                                {vendedor.login}
                                            </TableCell>
                                            <TableCell align="center" sx={{ [theme.breakpoints.down('sm')]: { fontSize: '0.85rem' } }}>
                                                <Switch
                                                    checked={vendedor.ativo}
                                                    disabled
                                                    inputProps={{ 'aria-label': 'status ativo do vendedor' }}
                                                />
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    [theme.breakpoints.down('sm')]: { display: 'none' },
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {vendedor.comissao !== null ? `${vendedor.comissao}%` : ''}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    [theme.breakpoints.down('sm')]: { display: 'none' },
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {vendedor.email || ''}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    [theme.breakpoints.down('sm')]: { display: 'none' },
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {vendedor.whatsapp || ''}
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    [theme.breakpoints.down('sm')]: { paddingLeft: '4px', paddingRight: '4px' },
                                                    width: '1%', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <IconButton
                                                    aria-label="editar"
                                                    onClick={() => handleEditVendedor(vendedor.id)}
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
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalRows}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Linhas por página:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                        }
                    />
                </Paper>
            )}

            <Dialog
                open={deleteConfirmOpen}
                onClose={handleCloseDeleteConfirm}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirmar Exclusão"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja excluir este vendedor? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirm} disabled={isDeleting}>Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeleting}>
                        {isDeleting ? <MuiCircularProgress size={24} /> : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default VendedoresList;