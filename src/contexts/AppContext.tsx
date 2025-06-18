'use client';

import { AppContextType, Sorteio } from '@common/data';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [sorteio, setSorteio] = useState<Sorteio | null>(null);
  const [loading, setLoading] = useState(false);

  // LocalStorage - Sorteio
  useEffect(() => {
    const saved = localStorage.getItem('sorteioSelecionado');
    if (saved) setSorteio(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (sorteio) {
      localStorage.setItem('sorteioSelecionado', JSON.stringify(sorteio));
    } else {
      localStorage.removeItem('sorteioSelecionado');
    }
  }, [sorteio]);

  // Controle de loading
  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  const value: AppContextType = {
    sorteio,
    setSorteio,
    loading,
    showLoader,
    hideLoader,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
