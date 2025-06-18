'use client';

import { ApiResult } from '@common/data';
import AuthGuard from '@components/AuthGuard';
import { CustomHead } from '@components/Layout/Head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaUser, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAppContext } from 'src/contexts/AppContext';
import { useAuth } from 'src/contexts/AuthContext';
import { instance } from 'src/services/axios';

export default function RestaurarSenha() {
    const router = useRouter();
    const [login, setLogin] = useState('');
    const { loading, showLoader, hideLoader } = useAppContext();
    const [mensagem, setMensagem] = useState<string | null>(null);
    const [erro, setErro] = useState(false);
    const { user, logout } = useAuth();

    const handleRestaurar = async () => {
        if (!login.trim()) {
            setMensagem('Informe o login.');
            setErro(true);
            return;
        }

        showLoader();
        setMensagem(null);
        setErro(false);

        try {
            const token = user?.token;
            const resposta = await instance.put(`/restaurarsenha?token=${token}&login=${login}`, {

            });
            const apiResult: ApiResult = resposta.data;

            if (!apiResult.success) {
                toast.error(apiResult.errorMessage)
                throw new Error('Falha ao restaurar senha');
            }

            toast.success('Senha restaurada com sucesso!');

        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Erro desconhecido');
        } finally {
            hideLoader();
        }
    };

    return (
        <AuthGuard profiles={['ADMIN', 'SUPERVISOR', 'CAMBISTA']} checkSenhaAlterada={false}>
            <main className="min-h-screen mt-[100px] mx-auto py-[9px] px-[3px] bg-[#fff] rounded-[20px]">
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
                <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <h1 className="text-xl font-semibold mb-4 text-gray-700">Restaurar Senha de Usuário</h1>

                    <label className="block mb-2 text-sm font-medium text-gray-700">Login do usuário</label>
                    <div className="flex items-center border rounded px-2 bg-gray-50">
                        <FaUser className="text-gray-400" />
                        <input
                            type="number"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            className="w-full p-2 outline-none bg-transparent"
                            placeholder="Digite o login"
                        />
                    </div>

                    <button
                        onClick={handleRestaurar}
                        disabled={loading}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
                    >
                        {loading ? 'Restaurando...' : 'Restaurar Senha'}
                    </button>

                    {mensagem && (
                        <div
                            className={`mt-4 flex items-center gap-2 p-3 rounded ${erro ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}
                        >
                            {erro ? <FaTimesCircle /> : <FaCheckCircle />}
                            <span>{mensagem}</span>
                        </div>
                    )}
                </div>
            </main>
        </AuthGuard>
    );
}
