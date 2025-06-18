import { ApiResult } from '@common/data';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AuthGuard from '@components/AuthGuard';
import { useAuth } from 'src/contexts/AuthContext';
import { instance } from 'src/services/axios';
import { motion } from 'framer-motion';
import { CustomHead } from '@components/Layout/Head';
import { useRouter } from 'next/router';
import { FaUser as UserIcon, FaPhone as PhoneIcon, FaMoneyBillWave as CashIcon, FaPen as PencilIcon, FaTimes } from 'react-icons/fa';
import { Slider, Typography } from '@mui/material';
import { useAppContext } from 'src/contexts/AppContext';
import CustomButton from '@components/CustomButton';

interface Rota {
  id: number;
  nome: string;
  ativo: boolean;
  comissao: number; // Alterado para number para simplificar o frontend
  email: string;
  whatsapp: string;
  login: string;
}

export default function RotasCrud() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [rotas, setRotas] = useState<Rota[]>([]);
  const { loading, showLoader, hideLoader } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [currentRota, setCurrentRota] = useState<Rota | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    comissao: 0,
    email: '',
    whatsapp: '',
    login: ''
  });


  // Buscar rotas da API
  const fetchRotas = async () => {
    if (!user?.token) return;
    try {
      showLoader();
      const response = await instance.get(`/listarrotas?token=${user?.token}`);
      const apiResult: ApiResult = response.data;
      if (!apiResult.success) {
        toast.error(apiResult.errorMessage);
        throw new Error('Erro ao listar rotas');
      }
      setRotas(apiResult.data);
    } catch (error) {
      toast.error('Erro ao carregar rotas');
    } finally {
      hideLoader();
    }
  };
  useEffect(() => {
    fetchRotas();
  }, []);

  // Abrir modal para cadastro/edição
  const openModal = (rota: Rota | null = null) => {
    setCurrentRota(rota);
    setFormData({
      nome: rota?.nome || '',
      comissao: rota?.comissao || 0,
      email: rota?.email || '',
      whatsapp: rota?.whatsapp || '',
      login: rota?.login || ''
    });

    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentRota(null);
    setFormData({
      nome: '',
      comissao: 0,
      email: '',
      whatsapp: '',
      login: ''
    });

  };

  // Atualizar campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'whatsapp' ? formatWhatsApp(value) :
          value
    }));
  };

  // Atualizar campos do formulário
  const handleComissaoChange = (event: Event, newValue: number | number[]) => {
    setFormData({
      ...formData,
      comissao: newValue as number,
    });
  };

  const handleEdit = (rota: Rota) => {
    openModal(rota);
  };


  // Salvar rota (criar ou atualizar)
  const saveRota = async () => {
    const { nome, comissao, email, whatsapp } = formData;

    if (!nome.trim()) {
      toast.error('Informe o nome da rota');
      return;
    }

    if (!/^\d{4}$/.test(formData.login)) {
      toast.error('Login deve conter exatamente 4 dígitos numéricos');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('E-mail inválido');
      return;
    }

    if (!whatsapp || whatsapp.replace(/\D/g, '').length < 10) {
      toast.error('Número de WhatsApp inválido');
      return;
    }

    if (comissao < 0 || comissao > 50) {
      toast.error('Comissão deve estar entre 0 e 50');
      return;
    }

    try {
      const payload = {
        nome: formData.nome,
        comissao: formData.comissao,
        email: formData.email,
        whatsapp: formData.whatsapp,
        login: formData.login,
        id: currentRota?.id
      };

      const response = await instance.post(`cadastrarrota?token=${user?.token}`, payload);
      const apiResult: ApiResult = response.data;
      if (!apiResult.success) {
        toast.error(apiResult.errorMessage)
        throw new Error('Erro ao gerar arquivo');
      }

      toast.success(currentRota ? 'Rota atualizada com sucesso!' : 'Rota criada com sucesso!');

      await fetchRotas();
      closeModal();
    } catch (error) {
      toast.error('Erro ao salvar rota');
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11); // até 11 dígitos

    if (numbers.length <= 2)
      return `(${numbers}`;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };


  // Alternar status ativo/inativo
  const toggleStatus = async (rota: Rota) => {
    try {
      if (rota.ativo) {
        await instance.put(`/inativarrota?token=${user?.token}&rotaId=${rota.id}`);
        toast.success('Rota inativado com sucesso!');
      } else {
        await instance.put(`/ativarrota?token=${user?.token}&rotaId=${rota.id}`);
        toast.success('Rota ativado com sucesso!');
      }

      await fetchRotas();

    } catch (error) {
      toast.error('Erro ao alterar status do rota');
    }
  };

  return (
    <AuthGuard profiles={['ADMIN', 'SUPERVISOR']}>
      <main className="min-h-screen pt-[100px] mx-auto bg-white rounded-2xl shadow-lg">
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

        <div className="mx-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Rotas</h1>
            {profile === 'ADMIN' && (
              <CustomButton onClick={() => openModal()} disabled={loading}>
                Nova Rota
              </CustomButton>
            )}
          </div>

          {loading && <div className="text-center py-4">Carregando...</div>}

          <div className="min-h-[70vh] pr-2 my-4 pb-4">
            {rotas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma rota encontrada
              </div>
            ) : (

              <table className="w-full table-auto border border-gray-300 rounded overflow-hidden shadow">
                <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <tr>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Nome</th>
                    <th className="px-4 py-2">WhatsApp</th>
                    <th className="px-4 py-2">Comissão</th>
                    {(profile === 'ADMIN' || profile === 'SUPERVISOR') && (
                      <>
                        <th className="px-4 py-2">Ações</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rotas.map((rota, i) => {
                    const isAtivo = rota.ativo;
                    return (
                      <tr key={rota.id} className="border-b hover:bg-gray-50">
                        {/* Status */}
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${isAtivo ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {isAtivo ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>
                        {/* Nome */}
                        <td className="px-4 py-2 font-medium text-gray-800">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4 text-gray-600" />
                            <span className="truncate">{rota.nome}</span>
                          </div>
                        </td>

                        {/* WhatsApp */}
                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="w-4 h-4 text-gray-600" />
                            <a
                              href={`https://wa.me/${rota.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {rota.whatsapp}
                            </a>
                          </div>
                        </td>

                        {/* Comissão */}
                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <CashIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-green-600">{rota.comissao}%</span>
                          </div>
                        </td>

                        {/* Ações (condicional) */}
                        {(profile === 'ADMIN' || profile === 'SUPERVISOR') ? (
                          <td className="px-4 py-2 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStatus(rota);
                              }}
                              className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 transition"
                            >
                              {rota.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(rota);
                              }}
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center text-gray-700"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Editar
                            </button>
                          </td>
                        ) : (
                          <td className="px-4 py-2 text-center text-gray-400">—</td>
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
                    {currentRota ? 'Editar Rota' : 'Nova Rota'}
                  </h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition">
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {['nome', 'email', 'whatsapp'].map((field) => (
                    <div key={field}>
                      <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                        {field === 'nome' ? 'Nome da Rota *' : field}
                      </label>
                      <input
                        type={'text'}
                        id={field}
                        name={field}
                        value={(formData as any)[field]}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
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
                  <div>
                    <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                      Login (4 dígitos) *
                    </label>
                    <input
                      type="text"
                      id="login"
                      name="login"
                      value={formData.login}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      maxLength={4}
                      inputMode="numeric"
                      placeholder="Ex: 1234"
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
                      onClick={saveRota}
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