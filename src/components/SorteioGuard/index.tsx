// components/SorteioGuard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from 'src/contexts/AppContext';

export default function SorteioGuard({ children }: { children: React.ReactNode }) {
    const { sorteio } = useAppContext();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !sorteio) {
            router.push('/selecionar_sorteio'); // Redireciona se não houver sorteio selecionado
            toast.info('Selecione um sorteio antes de continuar');
        }
    }, [sorteio, mounted, router]);

    if (!mounted || !sorteio) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}