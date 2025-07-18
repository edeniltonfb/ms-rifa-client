// src/pages/builder.tsx
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import {
  Box,
  Button,
  Modal,
  Typography,
  Slider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Paper,
  Grid, // <--- Esta importação parece não estar sendo usada. Considerar remover se não for necessária.
  TextField,
  CircularProgress as MuiCircularProgress,
} from '@mui/material';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core';
import { CSS, Transform } from '@dnd-kit/utilities';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';

// --- Constantes (algumas alterações de nome para clareza) ---
const A4_PORTRAIT_WIDTH = 595; // px
const A4_PORTRAIT_HEIGHT = 842; // px
const DRAGGABLE_ITEM_WIDTH = 120; // px
const DRAGGABLE_ITEM_HEIGHT = 60; // px

// Estilo para o modal (sem alterações)
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// Componente Elemento Arrastável (inalterado, mas usa as novas constantes de tamanho)
interface DraggableItemProps {
  id: string;
  content: string;
  initialTransform: Transform;
}

function DraggableItem({ id, content, initialTransform }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const finalTransform: Transform = transform
    ? {
        x: initialTransform.x + transform.x,
        y: initialTransform.y + transform.y,
        scaleX: initialTransform.scaleX,
        scaleY: initialTransform.scaleY,
      }
    : initialTransform;

  const style = {
    transform: CSS.Translate.toString(finalTransform),
    cursor: transform ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      sx={{
        p: 2,
        m: 0,
        border: '1px solid grey',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: `${DRAGGABLE_ITEM_WIDTH}px`, // Usando a nova constante
        height: `${DRAGGABLE_ITEM_HEIGHT}px`, // Usando a nova constante
        fontWeight: 'bold',
        userSelect: 'none',
        boxShadow: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        '&:active': {
          boxShadow: 6,
        },
      }}
    >
      {content}
    </Paper>
  );
}

// Interface para a estrutura de dados das posições que serão enviadas no corpo (inalterada)
interface PrintPosition {
  xBilhete: number;
  yBilhete: number;
  xCanhoto: number;
  yCanhoto: number;
}

// --- Interface para os dados retornados pela API de layout ---
interface LayoutApiData {
  orientacao: 'RETRATO' | 'PAISAGEM';
  quantidade: number;
  // Propriedades dinâmicas como xBilhete1, yBilhete1, etc.
  [key: string]: number | string | null; // Adicionado para cobrir as chaves dinâmicas
}

const Builder: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numPositions, setNumPositions] = useState<number>(1);
  const [orientation, setOrientation] = useState<'retrato' | 'paisagem'>('retrato');

  const [panelConfig, setPanelConfig] = useState<{
    numElements: number;
    orientation: 'retrato' | 'paisagem';
    panelWidth: number;
    panelHeight: number;
  } | null>(null);

  const [itemTransforms, setItemTransforms] = useState<Record<string, Transform>>({});

  const [codigo, setCodigo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NOVO ESTADO: Para controlar o carregamento do layout inicial via API ---
  const [isFetchingLayout, setIsFetchingLayout] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setNumPositions(newValue as number);
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrientation(event.target.value as 'retrato' | 'paisagem');
  };

  // --- ALTERADO: handleSubmitForm para carregar layout via API ---
  const handleSubmitForm = async () => { // Tornada async
    if (!user?.token) {
      enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
      return;
    }

    setIsFetchingLayout(true); // Inicia o estado de carregamento do layout

    const orientationApiValue = orientation === 'retrato' ? 1 : 2; // 1 para Retrato, 2 para Paisagem
    const quantityApiValue = numPositions; // A quantidade selecionada pelo slider

    try {
      const url = `https://multisorteios.dev/msrifaadmin/api/carregarlayout?token=${user.token}&orientacao=${orientationApiValue}&quantidade=${quantityApiValue}`;

      const response = await fetch(url, {
        method: 'GET', // É uma requisição GET
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // Verifica se a API retornou sucesso e os dados esperados
      if (result.success && result.data) {
        const data: LayoutApiData = result.data; // Tipagem para o 'data' da resposta

        // Define as dimensões do painel com base na orientação da API e nas constantes A4
        const currentPanelWidth = data.orientacao === 'RETRATO' ? A4_PORTRAIT_WIDTH : A4_PORTRAIT_HEIGHT;
        const currentPanelHeight = data.orientacao === 'RETRATO' ? A4_PORTRAIT_HEIGHT : A4_PORTRAIT_WIDTH;
        const calculatedNumElements = data.quantidade * 2; // Total de elementos (pares de canhoto/bilhete)

        setPanelConfig({
          numElements: calculatedNumElements,
          orientation: data.orientacao.toLowerCase() as 'retrato' | 'paisagem', // Garante o tipo local ('retrato'/'paisagem')
          panelWidth: currentPanelWidth,
          panelHeight: currentPanelHeight,
        });

        const loadedTransforms: Record<string, Transform> = {};
        // Itera de 1 até a quantidade de pares recebida da API (e.g., 1 a 4)
        for (let i = 1; i <= data.quantidade; i++) {
          const xCanhoto = data[`xCanhoto${i}`];
          const yCanhoto = data[`yCanhoto${i}`];
          const xBilhete = data[`xBilhete${i}`];
          const yBilhete = data[`yBilhete${i}`];

          // Garante que os valores são números e não nulos antes de usar
          if (typeof xCanhoto === 'number' && typeof yCanhoto === 'number' &&
              typeof xBilhete === 'number' && typeof yBilhete === 'number') {

            // Mapeia os índices da API (1-based) para os IDs dos elementos (0-based)
            // Canhoto: item-0, item-2, item-4... (2 * (i - 1))
            // Bilhete: item-1, item-3, item-5... (2 * (i - 1) + 1)
            const canhotoElementId = `item-${2 * (i - 1)}`;
            const bilheteElementId = `item-${2 * (i - 1) + 1}`;

            loadedTransforms[canhotoElementId] = {
              x: Math.round(xCanhoto),
              y: Math.round(yCanhoto),
              scaleX: 1,
              scaleY: 1,
            };
            loadedTransforms[bilheteElementId] = {
              x: Math.round(xBilhete),
              y: Math.round(yBilhete),
              scaleX: 1,
              scaleY: 1,
            };
          } else {
            // Caso algum dado esteja faltando ou seja nulo, imprime um aviso no console
            console.warn(`Dados de posição incompletos ou inválidos para o par ${i}. xCanhoto: ${xCanhoto}, yCanhoto: ${yCanhoto}, xBilhete: ${xBilhete}, yBilhete: ${yBilhete}`);
          }
        }
        setItemTransforms(loadedTransforms);
        enqueueSnackbar('Layout carregado com sucesso!', { variant: 'success' });
        handleCloseModal(); // Fecha o modal após o sucesso
      } else {
        // Exibe a mensagem de erro da API ou uma mensagem padrão
        enqueueSnackbar(result.errorMessage || 'Erro ao carregar layout: Dados inválidos.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro na chamada da API de carregar layout:', error);
      enqueueSnackbar('Não foi possível conectar ao servidor para carregar o layout.', { variant: 'error' });
    } finally {
      setIsFetchingLayout(false); // Finaliza o estado de carregamento do layout
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    setItemTransforms((prevTransforms) => {
      const prevTransform = prevTransforms[active.id] || { x: 0, y: 0, scaleX: 1, scaleY: 1 };
      return {
        ...prevTransforms,
        [active.id]: {
          x: prevTransform.x + delta.x,
          y: prevTransform.y + delta.y,
          scaleX: prevTransform.scaleX,
          scaleY: prevTransform.scaleY,
        },
      };
    });
  };

  const getItemContent = (index: number) => {
    const num = Math.floor(index / 2) + 1;
    return index % 2 === 0 ? `Canhoto ${num}` : `Bilhete ${num}`;
  };

  // --- FUNÇÃO AUXILIAR REFATORADA PARA CHAMADAS À API DE IMPRESSÃO (inalterada) ---
  const handlePrintApiCall = async (
    endpointSuffix: string,
    requiresCodigoValidation: boolean
  ) => {
    if (!user?.token) {
      enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
      return;
    }
    if (!panelConfig) {
      enqueueSnackbar('Por favor, configure o layout antes de gerar o arquivo.', { variant: 'warning' });
      return;
    }
    if (requiresCodigoValidation && codigo.length !== 5) {
      enqueueSnackbar('O código deve ter 5 caracteres.', { variant: 'warning' });
      return;
    }

    setIsSubmitting(true);

    const printPositions: PrintPosition[] = [];
    for (let i = 0; i < panelConfig.numElements; i += 2) {
      const canhotoId = `item-${i}`;
      const bilheteId = `item-${i + 1}`;

      const canhotoTransform = itemTransforms[canhotoId];
      const bilheteTransform = itemTransforms[bilheteId];

      if (!canhotoTransform || !bilheteTransform) {
        enqueueSnackbar('Erro: Posições de todos os Canhotos/Bilhetes não foram encontradas.', { variant: 'error' });
        setIsSubmitting(false);
        return;
      }

      printPositions.push({
        xCanhoto: Math.round(canhotoTransform.x),
        yCanhoto: Math.round(canhotoTransform.y),
        xBilhete: Math.round(bilheteTransform.x),
        yBilhete: Math.round(bilheteTransform.y),
      });
    }

    try {
      let url = `https://multisorteios.dev/msrifaadmin/api/${endpointSuffix}?token=${user.token}`;
      if (requiresCodigoValidation) {
        url += `&codigo=${codigo}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printPositions),
      });

       if (endpointSuffix === 'gerararquivotesteimpressao') {
        if (response.ok) { // Verifica se a resposta foi bem-sucedida (status 2xx)
          const contentType = response.headers.get('Content-Type');

          // Verifica se o Content-Type é realmente PDF
          if (contentType && contentType.includes('application/pdf')) {
            const blob = await response.blob(); // Obtém a resposta como um Blob
            const fileURL = window.URL.createObjectURL(blob); // Cria um URL temporário para o Blob

            // Cria um link oculto e simula um clique para iniciar o download
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', 'layout_teste.pdf'); // Nome do arquivo para download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // Remove o link
            window.URL.revokeObjectURL(fileURL); // Libera o URL do objeto

            enqueueSnackbar('Arquivo de teste de impressão baixado com sucesso!', { variant: 'success' });
            setCodigo(''); // Limpa o campo se esse comportamento for desejado
          } else {
            // Se o status foi OK, mas não é um PDF (ex: JSON de erro ou resposta vazia)
            // Tenta ler como JSON para obter mensagem de erro
            const errorResult = await response.json();
            enqueueSnackbar(errorResult.errorMessage || 'Erro inesperado: O arquivo de teste não foi um PDF.', { variant: 'error' });
          }
        } else {
          // Se a resposta não foi OK (ex: 4xx, 5xx), tenta ler como JSON para erro
          const errorResult = await response.json();
          enqueueSnackbar(errorResult.errorMessage || `Erro ao baixar arquivo de teste (Status: ${response.status}).`, { variant: 'error' });
        }
      } else {
        // --- Lógica EXISTENTE para 'gerararquivoimpressao' (que retorna JSON) ---
        const result = await response.json();
        if (result.success) {
          enqueueSnackbar('Arquivo de impressão gerado com sucesso!', { variant: 'success' });
          setCodigo('');
        } else {
          enqueueSnackbar(result.errorMessage || `Erro desconhecido ao gerar arquivo via ${endpointSuffix}.`, { variant: 'error' });
        }
      }

      
    } catch (error) {
      console.error(`Erro na chamada da API de ${endpointSuffix}:`, error);
      enqueueSnackbar(`Não foi possível conectar ao servidor para ${endpointSuffix}.`, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- As funções originais que chamam a auxiliar (inalteradas) ---
  const handleSubmitPrintFileTest = async () => {
    await handlePrintApiCall('gerararquivotesteimpressao', false);
  };

  const handleSubmitPrintFile = async () => {
    await handlePrintApiCall('gerararquivoimpressao', true);
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom component="h1">
        Construtor de Layout
      </Typography>

      {!panelConfig ? (
        <Box sx={{ mt: 0, textAlign: 'center' }}>
          <Button variant="contained" onClick={handleOpenModal}>
            Configurar Layout
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 0 }}>
          <Typography variant="h5" gutterBottom>
            Painel de Layout ({panelConfig.orientation === 'retrato' ? 'Retrato' : 'Paisagem'})
          </Typography>

          <Box sx={{ mt: 0, mb: 2 }}> {/* Adicionado mb para espaçamento com o painel */}
            <Button variant="outlined" onClick={() => setPanelConfig(null)}>
              Resetar Configuração
            </Button>
          </Box>

          <Paper
            sx={{
              p: 0,
              mt: 0, // Ajustado para 0 pois o Box acima já tem margem inferior
              border: '2px dashed grey',
              position: 'relative',
              overflow: 'hidden',
              width: `${panelConfig.panelWidth}px`,
              height: `${panelConfig.panelHeight}px`,
              minHeight: 'auto',
            }}
          >
            <DndContext onDragEnd={handleDragEnd}>
              {Array.from({ length: panelConfig.numElements }).map((_, i) => (
                <DraggableItem
                  key={`item-${i}`}
                  id={`item-${i}`}
                  content={getItemContent(i)}
                  initialTransform={itemTransforms[`item-${i}`] || { x: 0, y: 0, scaleX: 1, scaleY: 1 }}
                />
              ))}
            </DndContext>
          </Paper>

          <Paper sx={{ p: 2, mt: 4 }}>
            <Typography variant="h6" gutterBottom>Gerar Arquivo de Impressão</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Código (5 caracteres)"
                variant="outlined"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                inputProps={{ maxLength: 5 }}
                error={codigo.length > 0 && codigo.length !== 5}
                helperText={codigo.length > 0 && codigo.length !== 5 ? 'O código deve ter 5 caracteres.' : ''}
                sx={{ width: '250px' }}
              />
              <Button
                variant="contained"
                onClick={handleSubmitPrintFile}
                disabled={codigo.length !== 5 || isSubmitting || !panelConfig}
                sx={{ height: '56px', width: '160px' }}
              >
                {isSubmitting ? <MuiCircularProgress size={24} color="inherit" /> : 'Gerar Arquivo'}
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmitPrintFileTest}
                disabled={isSubmitting || !panelConfig}
                sx={{ height: '56px', width: '160px' }}
              >
                {isSubmitting ? <MuiCircularProgress size={24} color="inherit" /> : 'Testar'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Modal do Formulário: AGORA COM CARREGAMENTO DA API */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
            Configurar Layout do Painel
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <FormLabel htmlFor="num-positions-slider">Quantidade de Posições (1 a 8)</FormLabel>
            <Slider
              id="num-positions-slider"
              value={numPositions}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={8}
            />
            <Typography variant="body2" color="text.secondary">
              Serão {numPositions * 2} elementos arrastáveis.
            </Typography>
          </FormControl>

          <FormControl component="fieldset" sx={{ mt: 3 }}>
            <FormLabel component="legend">Orientação</FormLabel>
            <RadioGroup
              row
              aria-label="orientacao"
              name="row-radio-buttons-group"
              value={orientation}
              onChange={handleRadioChange}
            >
              <FormControlLabel value="retrato" control={<Radio />} label="Retrato" />
              <FormControlLabel value="paisagem" control={<Radio />} label="Paisagem" />
            </RadioGroup>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSubmitForm}
            sx={{ mt: 4 }}
            fullWidth
            disabled={isFetchingLayout} 
          >
            {isFetchingLayout ? <MuiCircularProgress size={24} color="inherit" /> : 'Confirmar'} {/* <-- Spinner de carregamento */}
          </Button>
        </Box>
      </Modal>
    </Layout>
  );
};

export default Builder;