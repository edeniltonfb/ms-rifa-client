// pages/extrato-vendas.tsx

import { Fragment, memo, useEffect, useState } from 'react';
import { useAuth } from 'src/contexts/AuthContext';
import { instance } from 'src/services/axios';
import { CustomHead } from '@components/Layout/Head';
import { Disclosure, Transition } from '@headlessui/react';
import { currencyFormat } from '@common/utils/utils';
import { useAppContext } from 'src/contexts/AppContext';
import AuthGuard from '@components/AuthGuard';
import SorteioGuard from '@components/SorteioGuard';
import { ApiResult, ExtratoVendaRotaTO } from '@common/data';
import { mockExtratoRota } from '@common/mock';
import { ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';


const ExtratoRota = () => {
  const { user } = useAuth();

  const [extrato, setExtrato] = useState<ExtratoVendaRotaTO | null>(null);
  const { sorteio, loading, showLoader, hideLoader } = useAppContext();

  useEffect(() => {
    async function carregarExtrato() {
      if (!user?.token) return;

      try {
        showLoader();
        const resposta = await instance.get(
          `/extratovendasrota?token=${user.token}&bolaoId=${sorteio?.id}`
        );

        const apiResult: ApiResult = resposta.data;

        if (!apiResult.success) {
          toast.error(apiResult.errorMessage);
          throw new Error('Erro ao carregar extrato');

        }

        setExtrato(apiResult.data);
        //setExtrato(mockExtratoRota)
      } catch (erro) {
        console.error('Erro ao buscar extrato:', erro);
        toast.error('Erro ao carregar extrato');
      } finally {
        hideLoader();
      }
    }

    carregarExtrato();
  }, [user?.token]);

  if (loading) {
    return <div className="p-4 mt-[100px]">Carregando extrato...</div>;
  }

  if (!extrato) {
    // return <div className="p-4 mt-[100px]">Nenhum dado encontrado.</div>;
  }
  return (
    <main className="min-h-screen pt-[5px] mx-auto bg-white rounded-2xl shadow-lg px-2">
      <CustomHead />
      {extrato &&
        <>
          {/* Resumo geral */}
          <ResumoGeral extrato={extrato} />

          {/* Painéis de Rotas */}
          <div className="mt-5 space-y-2">
            <h2 className="text-xl font-semibold mb-2">Cambistas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeader title="Cambista" />
                    <TableHeader title="Vendas" />
                    <TableHeader title="Apostas" />
                    <TableHeader title="Arrecadação" />
                    <TableHeader title="Comissão" />
                    <TableHeader title="Valor Líquido" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {extrato?.extratoCambistaList.map((cambista) => (
                    <tr key={cambista.cambista}>
                      <TableCell>{cambista.cambista}</TableCell>
                      <TableCell>{cambista.vendasRealizadas ?? 0}</TableCell>
                      <TableCell>{cambista.apostasRegistradas ?? 0}</TableCell>
                      <TableCell>{currencyFormat(cambista.arrecadacao ?? 0)}</TableCell>
                      <TableCell>{currencyFormat(cambista.comissao ?? 0)}</TableCell>
                      <TableCell>{currencyFormat(cambista.valorLiquido ?? 0)}</TableCell>
                    </tr>
                  ))}
                </tbody>
                {extrato && (
                  <tfoot className="bg-gray-100 border-t">
                    <tr>
                      <TableTotalCell>Total</TableTotalCell>
                      <TableTotalCell>
                        {extrato.extratoCambistaList.reduce((acc, c) => acc + (c.vendasRealizadas ?? 0), 0)}
                      </TableTotalCell>
                      <TableTotalCell>
                        {extrato.extratoCambistaList.reduce((acc, c) => acc + (c.apostasRegistradas ?? 0), 0)}
                      </TableTotalCell>
                      <TableTotalCell>
                        {currencyFormat(extrato.extratoCambistaList.reduce((acc, c) => acc + (c.arrecadacao ?? 0), 0))}
                      </TableTotalCell>
                      <TableTotalCell>
                        {currencyFormat(extrato.extratoCambistaList.reduce((acc, c) => acc + (c.comissao ?? 0), 0))}
                      </TableTotalCell>
                      <TableTotalCell>
                        {currencyFormat(extrato.extratoCambistaList.reduce((acc, c) => acc + (c.valorLiquido ?? 0), 0))}
                      </TableTotalCell>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      }

    </main>
  );
}

const ExtratoVendasRotaPage = () => (
  <AuthGuard profiles={['SUPERVISOR']}>
    <SorteioGuard>
      <ExtratoRota />
    </SorteioGuard>
  </AuthGuard>
);

export default ExtratoVendasRotaPage;

const ResumoGeral: React.FC<{ extrato: any }> = ({ extrato }) => (
  <div className="bg-white shadow-md rounded-md p-2">
    <h2 className="text-xl font-semibold mb-2">Resumo Geral</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      <ResumoItem label="Vendas Realizadas" value={extrato.vendasRealizadas} />
      <ResumoItem label="Apostas Registradas" value={extrato.apostasRegistradas} />
      <ResumoItem label="Arrecadação" value={currencyFormat(extrato.arrecadacao)} />
      <ResumoItem label="Comissão Rota" value={currencyFormat(extrato.comissaoRota)} />
      <ResumoItem label="Comissão Cambista" value={currencyFormat(extrato.comissaoCambista)} />
      <ResumoItem label="Valor Líquido" value={currencyFormat(extrato.valorLiquido)} />
    </div>
  </div>
);

const ResumoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col p-2 border rounded-md bg-gray-50">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);

const TableHeader: React.FC<{ title: string }> = ({ title }) => (
  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider bg-gray-800 rounded-t-md">
    {title}
  </th>
);

const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 border">{children}</td>
);

const TableTotalCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-50 border bg-gray-500">
    {children}
  </td>
);

