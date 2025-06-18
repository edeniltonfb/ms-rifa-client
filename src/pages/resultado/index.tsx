import { useState, useEffect } from 'react';
import { ApiResult, Resultado } from '@common/data';
import { instance } from 'src/services/axios';
import { useAuth } from 'src/contexts/AuthContext';
import { Button } from '@components/button';
import { useAppContext } from 'src/contexts/AppContext';
import { CustomHead } from '@components/Layout/Head';
import { useRouter } from 'next/router';
import { formatDate } from '@common/utils/utils';
import AuthGuard from '@components/AuthGuard';
import SorteioGuard from '@components/SorteioGuard';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { toast } from 'react-toastify';
import DataInput from '@components/Input/DateInput';


export default function SelecionarSorteio() {
    const { user, profile } = useAuth();
    const router = useRouter();

    const { sorteio, loading, showLoader, hideLoader } = useAppContext();
    const [resultados, setResultados] = useState<Resultado[]>([]);
    const [editando, setEditando] = useState<Resultado | null>(null);
    const [showForm, setShowForm] = useState(false);

    const horarios = [

        { label: '09 Hs Rio', value: '09R' },
        { label: '11 Hs Rio', value: '11R' },
        { label: '14 Hs Rio', value: '14R' },
        { label: '16 Hs Rio', value: '16R' },
        { label: '18 Hs Rio', value: '18R' },
        { label: 'Federal 19 Hs', value: 'FED' },
        { label: '21 Hs Rio', value: '21R' }
    ];

    const [form, setForm] = useState<Resultado>({
        processado: false,
        bolaoId: sorteio?.id || 0,
        horario: '',
        data: formatDate(Date.now()),
        tmAtu: Date.now(),
        _1Premio: '',
        _2Premio: '',
        _3Premio: '',
        _4Premio: '',
        _5Premio: '',
        resultadoId: 0
    });

    useEffect(() => {
        if (!user?.token || !sorteio?.id) return;
        fetchResultados();
    }, [user, sorteio]);

    const fetchResultados = async () => {

        try {
            showLoader();
            const response = await instance.get(`/listarresultado?token=${user?.token}&bolaoId=${sorteio?.id}`);
            const apiResult: ApiResult = response.data;
            if (!apiResult.success) {
                toast.error(apiResult.errorMessage);
                throw new Error('Erro ao listar resultados');
            }
            setResultados(apiResult.data);
        } catch (err) {
            alert('Erro ao buscar resultados.');
        } finally {
            hideLoader();
        }
    };

    const salvar = async () => {

        try {
            showLoader();
            const payload = {
                ...form,

            };

            const response = await instance.post(`/informarresultado?token=${user?.token}`, payload);
            const apiResult: ApiResult = response.data;
            if (!apiResult.success) {
                toast.error(apiResult.errorMessage);
                throw new Error('Erro ao salvar resultado');
            }

            setShowForm(false);
            await fetchResultados();
        } catch (error) {
            alert('Erro ao salvar resultado: ' + (error as Error).message);
        } finally {
            hideLoader();
        }
    };

    const processarResultado = async (resultadoId: number, tmatu: number) => {


        const confirmarProcessamento = async () => {
            const result = await Swal.fire({
                title: 'Tem certeza que deseja processar o resultado?',
                text: 'Você não poderá desfazer essa ação!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, processar!',
                cancelButtonText: 'Cancelar',
                customClass: {
                    confirmButton: 'bg-[#F00] text-white px-4 py-2 rounded hover:bg-gray-800 mr-1',
                    cancelButton: 'bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 ml-1',
                },
                buttonsStyling: false,
            });

            if (result.isConfirmed) {

                try {
                    showLoader();
                    const response = await instance.put(`/processarresultado?token=${user?.token}&resultadoId=${resultadoId}&tmatu=${tmatu}`);
                    const apiResult: ApiResult = response.data;
                    if (!apiResult.success) {
                        toast.error(apiResult.errorMessage);
                        throw new Error('Erro ao processar resultado');
                    }
                    await fetchResultados();
                    Swal.fire({
                        title: 'Processado!',
                        text: 'O resultado foi processado.',
                        icon: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Ok',
                        customClass: {
                            confirmButton: 'bg-[#0F0] text-white px-4 py-2 rounded hover:bg-gray-800 mr-1',
                        },
                        buttonsStyling: false,
                    });
                } catch (err) {
                    alert('Erro ao processar resultado.');
                } finally {
                    hideLoader();
                }

            }
        };

        confirmarProcessamento();
    };

    const excluir = async (resultadoId: number, tmatu: number) => {


        const confirmarExclusao = async () => {
            const result = await Swal.fire({
                title: 'Tem certeza que deseja excluir o resultado?',
                text: 'Você não poderá desfazer essa ação!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar',
                customClass: {
                    confirmButton: 'bg-[#F00] text-white px-4 py-2 rounded hover:bg-gray-800 mr-1',
                    cancelButton: 'bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 ml-1',
                },
                buttonsStyling: false,
            });

            if (result.isConfirmed) {

                try {
                    showLoader();
                    const response = await instance.put(`/excluirresultado?token=${user?.token}&resultadoId=${resultadoId}&tmatu=${tmatu}`);
                    const apiResult: ApiResult = response.data;
                    if (!apiResult.success) {
                        toast.error(apiResult.errorMessage);
                        throw new Error('Erro ao excluir resultado');
                    }
                    await fetchResultados();
                    Swal.fire({
                        title: 'Excluído!',
                        text: 'O resultado foi excluído.',
                        icon: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Ok',
                        customClass: {
                            confirmButton: 'bg-[#0F0] text-white px-4 py-2 rounded hover:bg-gray-800 mr-1',
                        },
                        buttonsStyling: false,
                    });
                } catch (err) {
                    alert('Erro ao excluir resultado.');
                } finally {
                    hideLoader();
                }

            }
        };

        confirmarExclusao();

    };

    const editar = (res: Resultado) => {
        setForm({
            ...res,
            data: res.data || formatDate(Date.now()),
            tmAtu: Date.now()
        });
        setEditando(res);
        setShowForm(true);
    };

    const novoResultado = () => {
        setForm({
            processado: false,
            bolaoId: sorteio?.id || 0,
            horario: '',
            data: formatDate(Date.now()),
            tmAtu: Date.now(),
            _1Premio: '',
            _2Premio: '',
            _3Premio: '',
            _4Premio: '',
            _5Premio: '',
            resultadoId: 0
        });
        setEditando(null);
        setShowForm(true);
    };

    const formatPremio = (value: string) => {
        const onlyDigits = value.replace(/\D/g, '').slice(0, 4);
        return onlyDigits.replace(/(\d{2})(\d{0,2})/, (_, p1, p2) => p2 ? `${p1}.${p2}` : p1);
    };

    const handleChange = (field: keyof Resultado, value: string) => {
        if (field.includes('Premio')) {
            value = formatPremio(value);
        }
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <AuthGuard profiles={['ADMIN', 'SUPERVISOR', 'CAMBISTA']}>
            <SorteioGuard>
                <main className="min-h-[1000px]  overflow-auto pt-[100px] mx-auto bg-white rounded-2xl shadow-lg">
                    <CustomHead />
                    <div className="mb-6 px-2">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Voltar
                        </button>
                    </div>

                    <div className="max-w-md mx-5">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-semibold">Resultados</h1>
                            {profile === 'ADMIN' && (
                                <Button onClick={novoResultado} disabled={loading}>
                                    Novo Resultado
                                </Button>
                            )}
                        </div>

                        {loading && <div className="text-center py-4">Carregando...</div>}

                        <div className="max-h-[70vh] pr-2 mt-4">
                            {resultados.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhum resultado encontrado
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xs:grid-cols-2  gap-4 pb-[100px]">
                                    {resultados.map((res, i) => {
                                        const statusClass = `rounded-xl p-2 border shadow-sm ${res.processado ? 'bg-blue-100' : 'bg-yellow-100'}`;
                                        return (

                                            <motion.div
                                                key={res.resultadoId}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                            >

                                                <div className={statusClass}>
                                                    <div className="text-lg font-semibold text-center">
                                                        {res.data}
                                                    </div>
                                                    <div className="text-lg font-semibold text-center">
                                                        {horarios.find(h => h.value === res.horario)?.label}
                                                    </div>
                                                    <hr className="my-1 border-black" />
                                                    <div className="mt-2 space-y-1 text-[30px] font-bold text-center">
                                                        {[1, 2, 3, 4, 5].map(n => (
                                                            <div key={n}>{n}º: {res[`_${n}Premio` as keyof Resultado]}</div>
                                                        ))}
                                                    </div>

                                                    <div className='mt-3 h-[25px]'>
                                                        <hr className="my-1 border-black" />
                                                        {profile === 'ADMIN' && !res.processado && (
                                                            <div className="flex justify-between text-sm">

                                                                <button
                                                                    onClick={() => editar(res)}
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    onClick={() => processarResultado(res.resultadoId!, res.tmAtu)}
                                                                    className="text-green-600 hover:underline"
                                                                >
                                                                    Processar
                                                                </button>

                                                                <button
                                                                    onClick={() => excluir(res.resultadoId!, res.tmAtu)}
                                                                    className="text-red-600 hover:underline"
                                                                >
                                                                    Excluir
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {showForm && (
                                <motion.div
                                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className="bg-white p-6 rounded-xl w-[90%] max-w-md"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-xl font-semibold mb-4">
                                            {editando ? 'Editar Resultado' : 'Novo Resultado'}
                                        </h2>

                                        <div className="space-y-2">
                                            <div className='flex flex-grid space-between'>
                                                <FieldRow label="Horário">
                                                    <select
                                                        value={form.horario}
                                                        onChange={e => handleChange('horario', e.target.value)}
                                                        className="border px-3 py-1 rounded w-full"
                                                        disabled={loading}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {horarios.map(h => (
                                                            <option key={h.value} value={h.value}>
                                                                {h.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FieldRow>

                                                <FieldRow label="Data">
                                                    <DataInput
                                                        value={form.data}
                                                        onChange={(val) => setForm({ ...form, data: val })}
                                                    />
                                                </FieldRow>
                                            </div>
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <FieldRow key={n} label={`${n}º Prêmio`}>
                                                    <input
                                                        type="text"
                                                        value={form[`_${n}Premio` as keyof Resultado] as string}
                                                        onChange={e => handleChange(`_${n}Premio` as keyof Resultado, e.target.value)}
                                                        className="border px-3 py-1 rounded w-full text-lg tracking-wide"
                                                        disabled={loading}
                                                        placeholder="00.00"
                                                        maxLength={5}
                                                    />
                                                </FieldRow>
                                            ))}
                                        </div>

                                        <div className="mt-6 flex justify-end gap-4">
                                            <button
                                                onClick={() => setShowForm(false)}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                                disabled={loading}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={salvar}
                                                className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 disabled:opacity-50"
                                                disabled={loading}
                                            >
                                                {loading ? 'Salvando...' : 'Salvar'}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>



                    </div>
                </main>

            </SorteioGuard>
        </AuthGuard>
    );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0">
            <label className="font-medium text-gray-700">{label}</label>
            {children}
        </div>
    );
}