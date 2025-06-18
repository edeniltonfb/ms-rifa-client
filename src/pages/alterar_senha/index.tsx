import { ApiResult } from '@common/data';
import AuthGuard from '@components/AuthGuard';
import { CustomHead } from '@components/Layout/Head'
import { sha256 } from 'js-sha256';
import { useRouter } from 'next/router'
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from 'src/contexts/AppContext';
import { useAuth } from 'src/contexts/AuthContext';
import { instance } from 'src/services/axios';

export default function AlterarSenha() {

    const router = useRouter();
    const [formData, setFormData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { loading, showLoader, hideLoader } = useAppContext();
    const [successMessage, setSuccessMessage] = useState('');
    const { user, logout } = useAuth();

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const onlyNumbers = /^\d+$/;

        if (!formData.senhaAtual) newErrors.senhaAtual = 'Senha atual é obrigatória';

        if (!formData.novaSenha) {
            newErrors.novaSenha = 'Nova senha é obrigatória';
        } else if (formData.novaSenha.length < 6) {
            newErrors.novaSenha = 'Senha deve ter pelo menos 6 dígitos';
        } else if (!onlyNumbers.test(formData.novaSenha)) {
            newErrors.novaSenha = 'A senha deve conter apenas números';
        }

        if (formData.novaSenha !== formData.confirmarSenha) {
            newErrors.confirmarSenha = 'As senhas não coincidem';
        } else if (!onlyNumbers.test(formData.confirmarSenha)) {
            newErrors.confirmarSenha = 'A senha deve conter apenas números';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        showLoader();

        try {
            const token = user?.token;
            const hashedPassword = sha256(formData.senhaAtual);
            const hashedNewPassword = sha256(formData.novaSenha);
            const resposta = await instance.put(`/alterarsenha?token=${token}&senhaAtual=${hashedPassword}&novaSenha=${hashedNewPassword}`, {

            });
            const apiResult: ApiResult = resposta.data;

            if (!apiResult.success) {
                toast.error(apiResult.errorMessage)
                throw new Error('Falha ao alterar senha');
            }

            setSuccessMessage('Senha alterada com sucesso!');
            toast.success('Senha alterada com sucesso!. Faça login novamente');
            logout();
        } catch (error) {
            setErrors({
                submit: error instanceof Error ? error.message : 'Erro desconhecido'
            });
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
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <h2 className="mt-1 text-center text-3xl font-extrabold text-gray-900">
                            Alterar Senha
                        </h2>
                    </div>

                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                            {successMessage ? (
                                <div className="rounded-md bg-green-50 p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">{successMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    {errors.submit && (
                                        <div className="rounded-md bg-red-50 p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700">
                                            Senha Atual
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="senhaAtual"
                                                name="senhaAtual"
                                                type="password"
                                                inputMode="numeric"
                                                pattern="\d*"
                                                autoComplete="current-password"
                                                value={formData.senhaAtual}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full px-3 py-2 border ${errors.senhaAtual ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                            />
                                            {errors.senhaAtual && <p className="mt-2 text-sm text-red-600">{errors.senhaAtual}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700">
                                            Nova Senha (somente números)
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="novaSenha"
                                                name="novaSenha"
                                                type="password"
                                                inputMode="numeric"
                                                pattern="\d*"
                                                autoComplete="new-password"
                                                value={formData.novaSenha}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full px-3 py-2 border ${errors.novaSenha ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                            />
                                            {errors.novaSenha && <p className="mt-2 text-sm text-red-600">{errors.novaSenha}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
                                            Confirmar Nova Senha
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="confirmarSenha"
                                                name="confirmarSenha"
                                                type="password"
                                                inputMode="numeric"
                                                pattern="\d*"
                                                autoComplete="new-password"
                                                value={formData.confirmarSenha}
                                                onChange={handleChange}
                                                className={`appearance-none block w-full px-3 py-2 border ${errors.confirmarSenha ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                            />
                                            {errors.confirmarSenha && <p className="mt-2 text-sm text-red-600">{errors.confirmarSenha}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Alterando...
                                                </>
                                            ) : 'Alterar Senha'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}

