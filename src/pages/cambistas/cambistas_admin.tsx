import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AuthGuard from '@components/AuthGuard';
import { useAuth } from 'src/contexts/AuthContext';
import { instance } from 'src/services/axios';
import { ApiResult, Cambista, Rota } from '@common/data';
import { motion } from 'framer-motion';
import { FaUser as UserIcon, FaPhone as PhoneIcon, FaMoneyBillWave as CashIcon, FaPen as PencilIcon, FaTimes } from 'react-icons/fa';
import InputMask from 'react-input-mask';
import { Slider, Typography } from '@mui/material';
import { useAppContext } from 'src/contexts/AppContext';
import CustomButton from '@components/CustomButton';


export default function CambistasAdminCrud() {
  const { user, profile } = useAuth();
  const [cambistas, setCambistas] = useState<Cambista[]>([]);
  const { loading, showLoader, hideLoader } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [currentCambista, setCurrentCambista] = useState<Cambista | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    comissao: 0,
    email: '',
    whatsapp: '',
    rotaId: 0
  });
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [filteredCambistas, setFilteredCambistas] = useState<Cambista[]>([]);
  const [selectedRota, setSelectedRota] = useState<number | null>(null);
  const [loadingRotas, setLoadingRotas] = useState(true);

  // Buscar cambistas da API
  const fetchCambistas = async () => {
    if (!user?.token) return;
    try {
      showLoader();
      const response = await instance.get(`/listarcambistas?token=${user?.token}`);
      const apiResult: ApiResult = response.data;
      if (!apiResult.success) {
        toast.error(apiResult.errorMessage);
        throw new Error('Erro ao listar cambistas');
      }
      setCambistas(apiResult.data);
      setFilteredCambistas(apiResult.data);
    } catch (error) {
      toast.error('Erro ao carregar cambistas');
    } finally {
      hideLoader();
    }
  };
  const fetchRotas = async () => {
    if (!user?.token) {
      setLoadingRotas(false)
      return
    };
    try {
      const response = await instance.get(`/listarrotas?token=${user?.token}`);
      const apiResult: ApiResult = response.data;
      if (!apiResult.success) {
        toast.error(apiResult.errorMessage);
        throw new Error('Erro ao listar rotas');
      }
      setRotas(apiResult.data);
      setLoadingRotas(false);
    } catch (error) {
      toast.error('Erro ao carregar rotas');
      setLoadingRotas(false);
    }
  };
  useEffect(() => {
    fetchRotas();
    fetchCambistas();
  }, []);

  const filterByRota = (rotaId: number | null) => {
    setSelectedRota(rotaId);
    if (!rotaId) {
      setFilteredCambistas(cambistas);
    } else {
      const filtered = cambistas.filter((c: Cambista) => c.rotaId === rotaId);
      setFilteredCambistas(filtered);
    }
  };

  const handleEdit = (cambista: Cambista) => {
    openModal(cambista);
  };


  // Abrir modal para cadastro/edição
  const openModal = (cambista: Cambista | null = null) => {
    setCurrentCambista(cambista);
    setFormData({
      nome: cambista?.nome || '',
      comissao: cambista?.comissao || 0,
      email: cambista?.email || '',
      whatsapp: cambista?.whatsapp || '',
      rotaId: cambista?.rotaId || 0
    });
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentCambista(null);
    setFormData({
      nome: '',
      comissao: 0,
      email: '',
      whatsapp: '',
      rotaId: 0
    });
  };

  // Atualizar campos do formulário
  const handleComissaoChange = (event: Event, newValue: number | number[]) => {
    setFormData({
      ...formData,
      comissao: newValue as number,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Salvar cambista (criar ou atualizar)
  const saveCambista = async () => {
    if (!formData.nome.trim()) {
      toast.error('Informe o nome do cambista');
      return;
    }

    if (formData.comissao < 1 || formData.comissao > 50) {
      toast.error('Comissão deve estar entre 1 e 50');
      return;
    }

    if (!formData.whatsapp || !formData.whatsapp.trim) {
      toast.error('Informe o whatsapp do cambista');
      return;
    }

    const whatsappRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

    if (!whatsappRegex.test(formData.whatsapp)) {
      toast.error("O número de WhatsApp deve estar no formato (00) 00000-0000.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      toast.error('Informe um e-mail válido');
      return;
    }


    try {
      const payload = {
        nome: formData.nome,
        comissao: formData.comissao,
        email: formData.email,
        whatsapp: formData.whatsapp,
        rotaId: formData.rotaId,
        id: currentCambista?.id,
      };

      if (currentCambista) {
        // Atualizar cambista existente
        await instance.post(`/cadastrarcambista?token=${user?.token}`, payload);
        toast.success('Cambista atualizada com sucesso!');
      } else {
        // Criar nova cambista
        await instance.post(`/cadastrarcambista?token=${user?.token}`, payload);
        toast.success('Cambista criada com sucesso!');
      }

      // Recarregar lista
      fetchCambistas();
      closeModal();
    } catch (error) {
      toast.error('Erro ao salvar cambista');
    }
  };

  // Alternar status ativo/inativo
  const toggleStatus = async (cambista: Cambista) => {
    try {
      if (cambista.ativo) {
        await instance.put(`/inativarcambista?token=${user?.token}&cambistaId=${cambista.id}`);
        toast.success('Cambista inativado com sucesso!');
      } else {
        await instance.put(`/ativarcambista?token=${user?.token}&cambistaId=${cambista.id}`);
        toast.success('Cambista ativado com sucesso!');
      }

      await fetchCambistas();

    } catch (error) {
      toast.error('Erro ao alterar status do cambista');
    }
  };

  return (
    <AuthGuard profiles={['ADMIN', 'SUPERVISOR']}>
      <main className="min-h-screen pt-[10px] mx-auto bg-white rounded-2xl shadow-lg">

        <div className="mx-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Cambistas</h1>
            {profile === 'ADMIN' && (
              <CustomButton onClick={() => openModal()} disabled={loading}>
                Novo Cambista
              </CustomButton>
            )}
          </div>

          {/* Painel de Rotas */}
          <div className="mt-4 mb-6">
            <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2">
              <button
                onClick={() => filterByRota(null)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${!selectedRota ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Todos
              </button>

              {loadingRotas ? (
                <div className="px-4 py-2">Carregando rotas...</div>
              ) : (
                rotas.map(rota => (
                  <button
                    key={rota.id}
                    onClick={() => filterByRota(rota.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedRota === rota.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {rota.nome}
                  </button>
                ))
              )}
            </div>
          </div>

          {loading && <div className="text-center py-4">Carregando...</div>}

          <div className="min-h-[70vh] pr-2 my-4 pb-4">
            {cambistas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum cambista encontrado
              </div>
            ) : (
              <table className="min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Rota</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-left">WhatsApp</th>
                    <th className="px-4 py-2 text-left">Comissão</th>
                    {(profile === 'ADMIN' || profile === 'SUPERVISOR') && (
                      <th className="px-4 py-2 text-left">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredCambistas.map((cambista) => {
                    const isAtivo = cambista.ativo;
                    const rota = rotas.find(r => r.id === cambista.rotaId)?.nome || 'Não definida';

                    return (
                      <tr key={cambista.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${isAtivo ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {isAtivo ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{rota}</span>
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4 text-gray-600" />
                            <span>{cambista.nome}</span>
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="w-4 h-4 text-gray-600" />
                            <a
                              href={`https://wa.me/${cambista.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {cambista.whatsapp}
                            </a>
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <CashIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-green-600">{cambista.comissao}%</span>
                          </div>
                        </td>

                        {(profile === 'ADMIN' || profile === 'SUPERVISOR') && (
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStatus(cambista);
                                }}
                                className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 transition"
                              >
                                {isAtivo ? 'Desativar' : 'Ativar'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(cambista);
                                }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center text-gray-700"
                              >
                                <PencilIcon className="w-4 h-4 mr-1" />
                                Editar
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                  <h2 className="text-xl font-bold text-gray-800">
                    {currentCambista ? 'Editar Cambista' : 'Novo Cambista'}
                  </h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition">
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label htmlFor="rotaId" className="block text-sm font-medium text-gray-700">
                      Rota *
                    </label>
                    <select
                      id="rotaId"
                      name="rotaId"
                      value={formData.rotaId}
                      onChange={(e) => setFormData({ ...formData, rotaId: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      disabled={loadingRotas}
                    >
                      <option value="0">Selecione uma rota</option>
                      {rotas.map(rota => (
                        <option key={rota.id} value={rota.id}>
                          {rota.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div key={'whatsapp'}>
                    <label htmlFor={'whatsapp'} className="block text-sm font-medium text-gray-700 capitalize">
                      WhatsApp *
                    </label>
                    <InputMask
                      id='whatsapp'
                      mask="(99) 99999-9999"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      placeholder="(99) 99999-9999"
                    />
                  </div>

                  {['nome', 'email'].map((field) => (
                    <div key={field}>
                      <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                        {field === 'nome' ? 'Nome *' : field}
                      </label>
                      <input
                        type={field === 'comissao' ? 'number' : 'text'}
                        id={field}
                        name={field}
                        value={(formData as any)[field]}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        placeholder={`Digite ${field === 'comissao' ? 'a comissão (%)' : ''}`}
                      />
                    </div>
                  ))}

                  <div>
                    <Typography gutterBottom>Comissão: {formData.comissao}%</Typography>
                    <Slider
                      value={formData.comissao}
                      min={0}
                      max={50}
                      step={1}
                      onChange={handleComissaoChange}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`} // Exibe o valor com % no label
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveCambista}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

    </AuthGuard>
  );
}