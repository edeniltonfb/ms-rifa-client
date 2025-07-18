// src/hooks/useAuthGuard.ts
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * Hook para proteger rotas. Redireciona para /login se o usuário não estiver autenticado.
 * Deve ser usado em páginas protegidas.
 */
export const useAuthGuard = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated && router.pathname !== '/login') {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    return { isAuthenticated, isLoading };
};

export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
    const AuthComponent = (props: P): React.ReactElement | null => {
        const { isAuthenticated, isLoading } = useAuthGuard();

        let content: React.ReactElement | null; // Declara uma variável para o conteúdo

        if (isLoading) {
            content = (
                <Box sx= {{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }
        }>
            <CircularProgress />
            </Box>
      );
    } else if (!isAuthenticated) {
    content = null;
} else {
    content = <Component { ...props } />;
}

// Retorna a variável 'content' no final, garantindo que sempre há um retorno.
return content;
  };

AuthComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
return AuthComponent;
};