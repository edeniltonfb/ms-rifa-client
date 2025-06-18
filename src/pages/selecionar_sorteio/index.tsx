import { ApiResult, Sorteio } from '@common/data';
import AuthGuard from '@components/AuthGuard';
import { SorteioCard } from '@components/Cards';
import { CustomHead } from '@components/Layout/Head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from 'src/contexts/AppContext';
import { useAuth } from 'src/contexts/AuthContext';
import { instance } from 'src/services/axios';

export default function SelecionarSorteio() {

    const router = useRouter();

    const { setSorteio, showLoader, hideLoader } = useAppContext();
    const { user } = useAuth();
    const [sorteios, setSorteios] = useState<Sorteio[]>([]);

    useEffect(() => {
        if (!user?.token) return;
        buscarDados();
    }, [user]);

    const buscarDados = async () => {
        try {
            showLoader();
            const resposta = await instance.get(`/listarsorteios?token=${user?.token}`);
            const apiResult: ApiResult = resposta.data;

            if (apiResult.success) {
                setSorteios(apiResult.data);
            } else {
                router.back();
                toast.error(apiResult.errorMessage ?? 'Erro desconhecido');
            }

        } catch (erro) {
            console.error("Erro ao buscar dados:", erro);
        } finally {
            hideLoader();
        }
    };

    return (
        <AuthGuard profiles={['CAMBISTA', 'ADMIN', 'SUPERVISOR']}>
            <main className="min-h-screen pt-[100px] mx-auto bg-white rounded-2xl shadow-lg px-5">
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

                <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {sorteios.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSorteio(item);
                                router.back();
                            }}
                            className="text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <SorteioCard sorteio={item} />
                        </button>
                    ))}
                </div>

            </main>
        </AuthGuard>
    )

}
