// pages/extrato-vendas.tsx

import { memo } from 'react';
import { useAuth } from 'src/contexts/AuthContext';
import { CustomHead } from '@components/Layout/Head';
import { useRouter } from 'next/router';
import AuthGuard from '@components/AuthGuard';
import CambistasAdminCrud from './cambistas_admin';
import CambistasRotaCrud from './cambistas_rota';

const CambistasCrud = () => {
  const { profile } = useAuth();
  const router = useRouter();


  return (
    <main className="min-h-screen pt-[100px] mx-auto bg-white rounded-2xl shadow-lg px-2">
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


      {profile === 'SUPERVISOR' &&
        <CambistasRotaCrud />
      }
      {profile === 'ADMIN' &&
        <CambistasAdminCrud />
      }
    </main>
  );
}

const ExtratoVendasPage = () => (
  <AuthGuard profiles={['CAMBISTA', 'ADMIN', 'SUPERVISOR']}>
    <CambistasCrud />
  </AuthGuard>
);

export default memo(ExtratoVendasPage);


