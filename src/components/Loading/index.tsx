'use client';

import { Loader2 } from 'lucide-react'; // Ícone opcional (requer lucide-react)
import { useAppContext } from 'src/contexts/AppContext';

export default function GlobalLoader() {
  const { loading } = useAppContext();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-sm text-zinc-700 dark:text-zinc-300">Carregando...</span>
      </div>
    </div>
  );
}
