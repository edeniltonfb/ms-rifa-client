import AuthGuard from '@components/AuthGuard';
import ItemMenuButton from '@components/ItemMenuButton';
import { CustomHead } from '@components/Layout/Head';
import { useRouter } from 'next/router';
import {
    LockKeyhole,
    ShoppingCart,
    CalendarCheck,
    Receipt,
    Trophy,
    FileSpreadsheet,
    ListChecks,
    UserCircle2,
    Navigation,
    File
} from 'lucide-react';
import { useAuth } from 'src/contexts/AuthContext';

export default function Home() {
    const router = useRouter();
    const { profile } = useAuth();

    return (
        <AuthGuard profiles={['ADMIN', 'SUPERVISOR', 'CAMBISTA']}>
            <main className="max-w-screen min-h-screen pt-[100px] mx-auto bg-white rounded-2xl shadow-lg">
                <CustomHead />

                <div className="text-center py-6 px-4">
                    <h1 className="text-2xl font-bold text-gray-800">Painel Principal</h1>
                    <p className="text-gray-500 text-sm mt-1">Escolha uma opção abaixo</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 sm:gap-6 sm:p-6">

                    <ItemMenuButton onClick={() => router.push('/selecionar_sorteio')}>
                        <CalendarCheck size={28} />
                        Selecionar Sorteio
                    </ItemMenuButton>

                    {profile === 'CAMBISTA' &&
                        <ItemMenuButton onClick={() => router.push('/registrar_venda')}>
                            <ShoppingCart size={28} />
                            Registrar Venda
                        </ItemMenuButton>
                    }

                    {profile === 'CAMBISTA' &&
                        <ItemMenuButton onClick={() => router.push('/importacao')}>
                            <FileSpreadsheet size={28} />
                            Importação de Planilha
                        </ItemMenuButton>
                    }

                    <ItemMenuButton onClick={() => router.push('/extrato_vendas')}>
                        <Receipt size={28} />
                        Extrato de Vendas
                    </ItemMenuButton>

                    <ItemMenuButton onClick={() => router.push('/resultado')}>
                        <ListChecks size={28} />
                        Resultado
                    </ItemMenuButton>

                    <ItemMenuButton onClick={() => router.push('/ganhadores')}>
                        <Trophy size={28} />
                        Ganhadores
                    </ItemMenuButton>

                    <ItemMenuButton onClick={() => router.push('/arquivos')}>
                        <File size={28} />
                        Arquivos
                    </ItemMenuButton>

                    {profile === 'ADMIN' &&
                        <ItemMenuButton onClick={() => router.push('/rotas')}>
                            <Navigation size={28} />
                            Rotas
                        </ItemMenuButton>
                    }

                    {(profile === 'ADMIN' || profile === 'SUPERVISOR') &&
                        <ItemMenuButton onClick={() => router.push('/cambistas')}>
                            <UserCircle2 size={28} />
                            Cambistas
                        </ItemMenuButton>
                    }

                    <ItemMenuButton onClick={() => router.push('/alterar_senha')}>
                        <LockKeyhole size={28} />
                        Alterar Senha
                    </ItemMenuButton>

                    {profile === 'ADMIN' &&
                        <ItemMenuButton onClick={() => router.push('/restaurar_senha')}>
                            <LockKeyhole size={28} />
                            Restaurar Senha
                        </ItemMenuButton>
                    }

                </div>

            </main>
        </AuthGuard>
    );
}
