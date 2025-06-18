// pages/extrato-vendas.tsx

import { Fragment, useEffect, useState } from 'react';
import { useAuth } from 'src/contexts/AuthContext';
import { instance } from 'src/services/axios';
import toast from 'react-hot-toast';
import { CustomHead } from '@components/Layout/Head';
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import { currencyFormat } from '@common/utils/utils';
import { useAppContext } from 'src/contexts/AppContext';
import AuthGuard from '@components/AuthGuard';
import SorteioGuard from '@components/SorteioGuard';
import { ApiResult, ExtratoVendaAdminTO, ExtratoVendaRotaTO } from '@common/data';
import { ChevronDown } from 'lucide-react';

const ExtratoAdmin = () => {
  const { user } = useAuth();

  const [extrato, setExtrato] = useState<ExtratoVendaAdminTO | null>(null);
  const { sorteio, loading, showLoader, hideLoader } = useAppContext();

  useEffect(() => {
    async function carregarExtrato() {
      if (!user?.token) return;

      try {
        showLoader();
        const resposta = await instance.get(
          `/extratovendasadmin?token=${user.token}&bolaoId=${sorteio?.id}`
        );

        const apiResult: ApiResult = resposta.data;

        if (!apiResult.success) {
          toast.error('Erro ao carregar extrato');
          throw new Error('Erro ao carregar extrato');
        }

        setExtrato(resposta.data.data);
        //setExtrato(mockExtrato)
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
            <h2 className="text-xl font-semibold mb-2">Rotas</h2>
            {extrato?.extratoRotaList.map((rota) => (
              <RotaPanel key={rota.rota} rota={rota} />
            ))}
          </div>
        </>
      }

    </main>
  );
}

const ExtratoVendasAdminPage = () => (
  <AuthGuard profiles={['ADMIN', 'ADMIN']}>
    <SorteioGuard>
      <ExtratoAdmin />
    </SorteioGuard>
  </AuthGuard>
);

export default ExtratoVendasAdminPage;

const ResumoGeral: React.FC<{ extrato: any }> = ({ extrato }) => (
  <div className="bg-white shadow-md rounded-md p-2">
    <h2 className="text-xl font-semibold mb-2">Resumo Geral</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      <ResumoItem label="Vendas Realizadas" value={extrato.vendasRealizadas ?? 0} />
      <ResumoItem label="Apostas Registradas" value={extrato.apostasRegistradas ?? 0} />
      <ResumoItem label="Arrecadação" value={currencyFormat(extrato.arrecadacao ?? 0)} />
      <ResumoItem label="Comissão Rota" value={currencyFormat(extrato.comissaoRota ?? 0)} />
      <ResumoItem label="Comissão Cambista" value={currencyFormat(extrato.comissaoCambista ?? 0)} />
      <ResumoItem label="Valor Líquido" value={currencyFormat(extrato.valorLiquido ?? 0)} />
    </div>
  </div>
);

const ResumoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col p-2 border rounded-md bg-gray-50">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);


const RotaPanel: React.FC<{ rota: ExtratoVendaRotaTO }> = ({ rota }) => (
  <Disclosure>
    {({ open }) => (
      <div className="bg-white shadow rounded-md">
        <DisclosureButton className="flex w-full justify-between items-center px-3 py-1 text-left text-sm font-medium text-blue-900 bg-blue-100 hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500/75">
          <div className="grid grid-cols-3 w-full items-center mr-2 gap-1">
            {/* Coluna 1: Rota */}
            <span className="text-md font-bold ">{rota.rota}</span>

            {/* Coluna 2: Líquido */}
            <div className="flex flex-col min-w-[80px] items-end">
              <span className="hidden xs:inline-block text-xs text-gray-600">Líquido</span>
              <span className="hidden xs:inline-block text-sm text-gray-900">{currencyFormat(rota.valorLiquido)}</span>
            </div>

            {/* Coluna 3: Bruto */}
            <div className="flex flex-col min-w-[80px] items-end">
              <span className="text-xs text-gray-600">Bruto</span>
              <span className="text-sm text-gray-900">{currencyFormat(rota.arrecadacao)}</span>
            </div>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-blue-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </DisclosureButton>
        <Transition
          as={Fragment}
          enter="transition duration-300 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-200 ease-in"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <DisclosurePanel className="p-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 mb-2">
              <ResumoItem label="Vendas Realizadas" value={rota.vendasRealizadas ?? 0} />
              <ResumoItem label="Apostas Registradas" value={rota.apostasRegistradas ?? 0} />
              <ResumoItem label="Arrecadação" value={currencyFormat(rota.arrecadacao ?? 0)} />
              <ResumoItem label="Comissão Rota" value={currencyFormat(rota.comissaoRota ?? 0)} />
              <ResumoItem label="Comissão Cambista" value={currencyFormat(rota.comissaoCambista ?? 0)} />
              <ResumoItem label="Valor Líquido" value={currencyFormat(rota.valorLiquido ?? 0)} />
            </div>

            {/* Tabela de Cambistas */}
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
                  {rota.extratoCambistaList.map((cambista) => (
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
                {rota && (
                  <tfoot className="bg-gray-100 border-t">
                    <tr>
                      <TableTotalCell>Total</TableTotalCell>
                      <TableTotalCell>
                        {rota.extratoCambistaList.reduce((acc, c) => acc + (c.vendasRealizadas ?? 0), 0)}
                      </TableTotalCell>
                      <TableTotalCell>
                        {rota.extratoCambistaList.reduce((acc, c) => acc + (c.apostasRegistradas ?? 0), 0)}
                      </TableTotalCell>
                      <TableTotalCell>
                        {currencyFormat(rota.extratoCambistaList.reduce((acc, c) => acc + (c.arrecadacao ?? 0), 0))}
                      </TableTotalCell>
                      <TableTotalCell>
                        {currencyFormat(rota.extratoCambistaList.reduce((acc, c) => acc + (c.comissao ?? 0), 0))}
                      </TableTotalCell>
                      <TableTotalCell>
                        {currencyFormat(rota.extratoCambistaList.reduce((acc, c) => acc + (c.valorLiquido ?? 0), 0))}
                      </TableTotalCell>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </DisclosurePanel>
        </Transition>
      </div>
    )}
  </Disclosure>
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