import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AuthGuard from '@components/AuthGuard';
import { useAuth } from 'src/contexts/AuthContext';
import { instance } from 'src/services/axios';
import { ApiResult, Cambista } from '@common/data';
import { motion } from 'framer-motion';
import { FaUser as UserIcon, FaPhone as PhoneIcon, FaMoneyBillWave as CashIcon, FaPen as PencilIcon, FaTimes } from 'react-icons/fa';
import InputMask from 'react-input-mask';
import { Slider, Typography } from '@mui/material';
import { useAppContext } from 'src/contexts/AppContext';
import CustomButton from '@components/CustomButton';


export default function CambistasRotaCrud() {
  const { user } = useAuth();
  const [cambistas, setCambistas] = useState<Cambista[]>([]);
  const { loading, showLoader, hideLoader } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [currentCambista, setCurrentCambista] = useState<Cambista | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    comissao: 0,
    email: '',
    whatsapp: ''
  });
  const [filteredCambistas, setFilteredCambistas] = useState<Cambista[]>([]);

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

  useEffect(() => {
    fetchCambistas();
  }, []);


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
      whatsapp: cambista?.whatsapp || ''
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
      whatsapp: ''
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

    if (formData.comissao < 0 || formData.comissao > 50) {
      toast.error('Comissão deve estar entre 0 e 50');
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
        rotaId: user?.userId,
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

        <div className="max-w-md mx-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Cambistas</h1>
            <CustomButton onClick={() => openModal()} disabled={loading}>
              Novo Cambista
            </CustomButton>
          </div>


          {loading && <div className="text-center py-4">Carregando...</div>}

          <div className="min-h-[70vh] pr-2 my-4 pb-4">
            {cambistas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum cambista encontrado
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2  gap-2">
                {filteredCambistas.map((cambista, i) => {
                  const statusClass = cambista.ativo
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                    : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200';

                  return (
                    <motion.div
                      key={cambista.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer"
                    >
                      <div className={`${statusClass} rounded-xl border-2 p-2 shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col`}>
                        {/* Cabeçalho com status */}
                        <div className="flex justify-between items-center mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${cambista.ativo
                            ? 'bg-blue-500 text-white'
                            : 'bg-amber-500 text-white'
                            }`}>
                            {cambista.ativo ? 'ATIVO' : 'INATIVO'}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleStatus(cambista); }}
                              className="text-xs bg-white px-2 py-1 rounded-md shadow-sm hover:bg-gray-100 transition"
                            >
                              {cambista.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                          </div>
                        </div>

                        {/* Informações principais */}
                        <div className="space-y-2 flex-grow">

                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-bold text-gray-800 truncate">{cambista.nome}</h3>
                          </div>

                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="w-5 h-5 text-gray-600" />
                            <a
                              href={`https://wa.me/${cambista.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {cambista.whatsapp}
                            </a>
                          </div>

                          <div className="flex items-center space-x-2">
                            <CashIcon className="w-5 h-5 text-gray-600" />
                            <span className="font-medium">Comissão: <span className="text-green-600">{cambista.comissao}%</span></span>
                          </div>
                        </div>

                        {/* Rodapé com ações */}
                        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(cambista) }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition flex items-center"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Editar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
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