// pages/extrato-vendas.tsx

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'src/contexts/AuthContext';
import { instance } from 'src/services/axios';
import { CustomHead } from '@components/Layout/Head';
import { FaCalendarAlt, FaCoins, FaDownload, FaRedo, FaTicketAlt, FaTimes, FaTrashAlt, FaUser } from 'react-icons/fa';
import { currencyFormat } from '@common/utils/utils';
import { useAppContext } from 'src/contexts/AppContext';
import AuthGuard from '@components/AuthGuard';
import SorteioGuard from '@components/SorteioGuard';
import { ApiResult, Aposta, Extrato, Sorteio } from '@common/data';
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { toast } from 'react-toastify';



const ExtratoCambista = () => {
  const { user } = useAuth();

  const [extrato, setExtrato] = useState<Extrato | null>(null);
  const { sorteio, loading, showLoader, hideLoader } = useAppContext();
  const [filtroNome, setFiltroNome] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [sorteiosAtivos, setSorteiosAtivos] = useState<Sorteio[]>([]);
  const [bolaoSelecionado, setBolaoSelecionado] = useState<any>(null);
  const [apostaParaRepetir, setApostaParaRepetir] = useState<Aposta | null>(null);

  const apostasFiltradas = useMemo(() => {
    if (!extrato) return [];
    const termo = filtroNome.toLowerCase();
    return extrato.apostas.filter((aposta) =>
      aposta.nome.toLowerCase().includes(termo)
    );
  }, [extrato, filtroNome]);


  useEffect(() => {
    carregarExtrato();
  }, [user?.token]);

  async function carregarExtrato() {
    if (!user?.token) return;

    try {
      showLoader();
      const resposta = await instance.get(
        `/extratovendascambista?token=${user.token}&bolaoId=${sorteio?.id}`
      );

      const apiResult: ApiResult = resposta.data;

      if (!apiResult.success) {
        toast.error('Erro ao carregar extrato');

      }

      setExtrato(resposta.data.data);
    } catch (erro) {
      console.error('Erro ao buscar extrato:', erro);
      toast.error('Erro ao carregar extrato');
    } finally {
      hideLoader();
    }
  }

  const confirmarCancelamentoAposta = async (aposta: Aposta) => {
    const result = await Swal.fire({
      title: 'Cancelar bilhete?',
      text: 'Essa ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar!',
      cancelButtonText: 'Manter',
      customClass: {
        confirmButton: 'bg-[#F00] text-white px-4 py-2 rounded hover:bg-gray-800 mr-1',
        cancelButton: 'bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 ml-1',
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      cancelarAposta(aposta);
    }
  };

  const confirmarCancelamentoNumero = async (aposta: Aposta, numero: string) => {
    const result = await Swal.fire({
      title: 'Cancelar número?',
      text: `Deseja remover o número ${numero}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Manter',
      customClass: {
        confirmButton: 'bg-[#F00] text-white px-4 py-2 rounded hover:bg-gray-800 mr-1',
        cancelButton: 'bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 ml-1',
      },
    });

    if (result.isConfirmed) {
      cancelarNumero(aposta, numero);
    }
  };

  const cancelarAposta = async (aposta: Aposta) => {

    // lógica de cancelamento
    showLoader();
    try {
      const response = await instance.put(`/cancelaraposta?token=${user?.token}&bolaoId=${sorteio?.id}&bilheteId=${aposta?.bilheteId}`);
      const apiResult: ApiResult = response.data;
      if (!apiResult.success) {
        toast.error(apiResult.errorMessage);
        throw new Error('Erro ao cancelar bilhete');
      }
      await carregarExtrato();

      Swal.fire({
        title: 'Bilhete cancelado!',
        text: `O bilhete ${aposta.bilheteId} foi cancelado com sucesso.`,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'Ok',
        customClass: {
          confirmButton: 'bg-[#0F0] text-white px-4 py-2 rounded hover:bg-gray-800 mr-1',
        },
        buttonsStyling: false,
      });
    } catch (err) {
      toast.error('Erro ao cancelar bilhete.');
    } finally {
      hideLoader();
    }
  };

  const cancelarNumero = async (aposta: Aposta, numero: string) => {
    showLoader();
    try {
      const response = await instance.put(`/cancelarnumero?token=${user?.token}&bolaoId=${sorteio?.id}&bilheteId=${aposta?.bilheteId}&numero=${numero}`);
      const apiResult: ApiResult = response.data;
      if (!apiResult.success) {
        toast.error(apiResult.errorMessage);
        throw new Error('Erro ao cancelar número');
      }
      await carregarExtrato();

      Swal.fire({
        title: 'Número cancelado!',
        text: `O número ${numero} foi cancelado com sucesso. Faça o download do comprovante atualizado.`,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'Ok',
        customClass: {
          confirmButton: 'bg-[#0F0] text-white px-4 py-2 rounded hover:bg-gray-800 mr-1',
        },
        buttonsStyling: false,
      });
    } catch (err) {
      toast.error('Erro ao cancelar número.');
    } finally {
      hideLoader();
    }
    // lógica de cancelamento individual
  };

  const abrirModalRepetir = async (aposta: Aposta) => {
    try {
      showLoader();
      const resposta = await instance.get(`/listarsorteiosvendasabertas?token=${user?.token}`);
      const apiResult: ApiResult = resposta.data;

      if (!apiResult.success) {
        toast.error('Erro ao buscar sorteios');
        return;
      }

      setSorteiosAtivos(apiResult.data);
      setApostaParaRepetir(aposta);
      setModalAberto(true);
    } catch (erro) {
      toast.error('Erro ao buscar sorteios');
    } finally {
      hideLoader();
    }
  };

  const repetirJogo = async () => {
    if (!bolaoSelecionado || !apostaParaRepetir) return;

    try {
      showLoader();
      const resposta = await instance.post(
        `/repetirjogo?token=${user?.token}&bolaoId=${bolaoSelecionado.id}&bilheteId=${apostaParaRepetir.bilheteId}`
      );
      const apiResult: ApiResult = resposta.data;

      if (!apiResult.success) {
        toast.error(apiResult.errorMessage || 'Erro ao repetir jogo');
        return;
      }

      toast.success('Jogo repetido com sucesso!');
      setModalAberto(false);
      setApostaParaRepetir(null);
      setBolaoSelecionado(null);
      await carregarExtrato();
    } catch (erro) {
      toast.error('Erro ao repetir jogo');
    } finally {
      hideLoader();
    }
  };


  if (loading) {
    return <div className="p-4 mt-[100px]">Carregando extrato...</div>;
  }

  if (!extrato) {
    return <div className="p-4 mt-[100px]">Nenhum dado encontrado.</div>;
  }



  return (
    <main className="min-h-screen pt-[10px] mx-auto bg-white rounded-2xl shadow-lg px-2">
      <CustomHead />

      <h2 className="text-2xl font-bold text-purple-800 mb-4">Resumo</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 pp:gap-2 sm:gap-4 mb-8">
        <ResumoItem
          icon={<FaTicketAlt className="text-blue-500" />}
          label="Vendas"
          valor={extrato?.vendasRealizadas}
        />
        <ResumoItem
          icon={<FaUser className="text-green-600" />}
          label="Apostas"
          valor={extrato?.apostasRegistradas}
        />
        <ResumoItem
          icon={<FaCoins className="text-yellow-500" />}
          label="Arrecadação"
          valor={currencyFormat(extrato?.arrecadacao)}
        />
        <ResumoItem
          icon={<FaCoins className="text-red-500" />}
          label="Comissão"
          valor={currencyFormat(extrato?.comissao)}
        />
        <ResumoItem
          icon={<FaCoins className="text-purple-600" />}
          label="Líquido"
          valor={currencyFormat(extrato?.valorLiquido)}
        />
      </div>

      <h2 className="text-2xl font-bold text-purple-800 mb-2">Vendas ({extrato.vendasRealizadas})</h2>
      <div className="flex flex-col gap-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrar por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        {apostasFiltradas.map((aposta, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border-l-4 border-purple-600 shadow-md p-4 rounded-xl relative"
          >

            <div className='flex w-full justify-end' >

              <div className='flex flex-row gap-2'>

                {/* Botão de cancelar aposta */}
                <button
                  onClick={() => confirmarCancelamentoAposta(aposta)}
                  className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full transition duration-200"
                  title="Cancelar aposta"
                >
                  <FaTrashAlt />
                </button>
                {/* Botão de repetir jogo */}
                <button
                  onClick={() => abrirModalRepetir(aposta)}
                  className="text-blue-500 hover:text-white hover:bg-blue-500 p-2 rounded-full transition duration-200"
                  title="Repetir Jogo"
                >
                  <FaRedo style={{ transform: 'rotate(180deg)' }} />
                </button>


                {/* Botão de download */}
                {aposta.link && (
                  <a
                    href={aposta.link}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download do bilhete"
                    className="text-green-600 hover:text-white hover:bg-green-600 p-2 rounded-full transition duration-200"
                  >
                    <FaDownload />
                  </a>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center mb-3">
              <p className="font-bold text-lg flex items-center gap-2 text-purple-800">
                <FaUser />
                {aposta.nome}
              </p>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <FaCalendarAlt />
                {aposta.dataHora}
              </span>
            </div>

            <div className="flex justify-between items-center mb-3 text-sm text-gray-700">
              <p>
                <strong>Quantidade:</strong> {aposta.quantidade}
              </p>
              <p>
                <strong>Valor:</strong> {currencyFormat(aposta.valor)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono bg-gray-100 p-1 rounded">
              {aposta.numeros?.map((n, i) => (
                <div key={i} className="bg-white p-1 rounded shadow-inner">
                  <span>{n}</span> <button
                    onClick={() => confirmarCancelamentoNumero(aposta, n)}
                    className="text-xs text-red-500 hover:text-white hover:bg-red-500 p-1 rounded-full transition duration-200"
                    title="Cancelar número"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {
        modalAberto && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold text-purple-800 mb-4">Selecionar Bolão</h3>

              <select
                className="w-full p-2 border rounded mb-4"
                value={bolaoSelecionado?.id || ''}
                onChange={(e) => {
                  const selecionado = sorteiosAtivos.find(s => s.id === Number(e.target.value));
                  setBolaoSelecionado(selecionado);
                }}
              >
                <option value="">Selecione um bolão</option>
                {sorteiosAtivos.map((sorteio) => (
                  <option key={sorteio.id} value={sorteio.id}>
                    {sorteio.dataSorteio}
                  </option>
                ))}
              </select>

              {apostaParaRepetir && (
                <div className="mb-4 text-sm text-gray-800 space-y-1 bg-gray-100 p-3 rounded shadow-inner">
                  <p><strong>Nome:</strong> {apostaParaRepetir.nome}</p>
                  {apostaParaRepetir.telefone && <p><strong>Telefone:</strong> {apostaParaRepetir.telefone}</p>}
                  {apostaParaRepetir.cidade && <p><strong>Cidade:</strong> {apostaParaRepetir.cidade}</p>}

                  <div>
                    <strong>Jogos:</strong>
                    <div className="flex flex-col gap-1 mt-1 font-mono">
                      {apostaParaRepetir.numeros?.map((n, i) => (
                        <div key={i} className="bg-white p-1 rounded text-center">{n}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}


              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModalAberto(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={repetirJogo}
                  disabled={!bolaoSelecionado}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )
      }
    </main>
  );
}




const ExtratoVendasCambistaPage = () => (
  <AuthGuard profiles={['CAMBISTA', 'ADMIN']}>
    <SorteioGuard>
      <ExtratoCambista />
    </SorteioGuard>
  </AuthGuard>
);

export default ExtratoVendasCambistaPage;

function ResumoItem({
  icon,
  label,
  valor,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string | number | undefined;
}) {
  return (
    <div className="bg-white p-2 rounded-lg shadow flex items-center gap-1 pp:gap-2 sm:gap:4">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-lg font-bold">{valor}</div>
      </div>
    </div>
  );
}
