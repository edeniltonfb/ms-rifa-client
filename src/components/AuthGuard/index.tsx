'use client';

import GlobalLoader from '@components/Loading';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from 'src/contexts/AppContext';
import { useAuth } from 'src/contexts/AuthContext';

export default function AuthGuard({ children, profiles, checkSenhaAlterada = true }: { children: React.ReactNode, profiles: string[], checkSenhaAlterada?: boolean }) {
  const { isAuthenticated, isLoading, profile, senhaAlterada } = useAuth();
  const { setSorteio } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setSorteio(null);
      router.push('/login');
    }
    if (isAuthenticated && !profiles.includes(profile!)) {
      router.push('/acesso_negado');
    }

    if (isAuthenticated && !senhaAlterada && checkSenhaAlterada) {
      toast.error('Você precisa alterar sua sena antes de prosseguir')
      router.push('/alterar_senha');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <GlobalLoader />
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}