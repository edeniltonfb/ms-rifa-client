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
  Grid,
  TextField,
  CircularProgress as MuiCircularProgress,
} from '@mui/material';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core';
import { CSS, Transform } from '@dnd-kit/utilities';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';

// --- Constantes (sem alteração) ---
const A4_PORTRAIT_WIDTH = 595; // px
const A4_PORTRAIT_HEIGHT = 842; // px
const DRAGGABLE_ITEM_SIZE = 100; // px

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

// Componente Elemento Arrastável (sem alterações)
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
        width: `${DRAGGABLE_ITEM_SIZE}px`,
        height: `${DRAGGABLE_ITEM_SIZE}px`,
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

// Interface para a estrutura de dados das posições que serão enviadas no corpo
interface PrintPosition {
  xBilhete: number;
  yBilhete: number;
  xCanhoto: number;
  yCanhoto: number;
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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setNumPositions(newValue as number);
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrientation(event.target.value as 'retrato' | 'paisagem');
  };

  const handleSubmitForm = () => {
    const calculatedNumElements = numPositions * 2;
    const currentPanelWidth = orientation === 'retrato' ? A4_PORTRAIT_WIDTH : A4_PORTRAIT_HEIGHT;
    const currentPanelHeight = orientation === 'retrato' ? A4_PORTRAIT_HEIGHT : A4_PORTRAIT_WIDTH;

    setPanelConfig({
      numElements: calculatedNumElements,
      orientation: orientation,
      panelWidth: currentPanelWidth,
      panelHeight: currentPanelHeight,
    });

    const initialTransforms: Record<string, Transform> = {};
    for (let i = 0; i < calculatedNumElements; i++) {
      const randomX = Math.random() * (currentPanelWidth - DRAGGABLE_ITEM_SIZE);
      const randomY = Math.random() * (currentPanelHeight - DRAGGABLE_ITEM_SIZE);

      initialTransforms[`item-${i}`] = {
        x: Math.max(0, Math.floor(randomX)),
        y: Math.max(0, Math.floor(randomY)),
        scaleX: 1,
        scaleY: 1,
      };
    }
    setItemTransforms(initialTransforms);
    handleCloseModal();
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

  // --- ALTERAÇÃO: Submit para gerar arquivo de impressão com posições ---
  const handleSubmitPrintFile = async () => {
    if (codigo.length !== 5) {
      enqueueSnackbar('O código deve ter 5 caracteres.', { variant: 'warning' });
      return;
    }

    if (!user?.token) {
      enqueueSnackbar('Token de autenticação não disponível. Faça login novamente.', { variant: 'error' });
      return;
    }

    if (!panelConfig) {
      enqueueSnackbar('Por favor, configure o layout antes de gerar o arquivo.', { variant: 'warning' });
      return;
    }

    setIsSubmitting(true);

    // --- Montar a lista de posições para o corpo da requisição ---
    const printPositions: PrintPosition[] = [];
    for (let i = 0; i < panelConfig.numElements; i += 2) { // Iterar de 2 em 2 para pegar pares Canhoto/Bilhete
      const canhotoId = `item-${i}`;
      const bilheteId = `item-${i + 1}`;

      const canhotoTransform = itemTransforms[canhotoId];
      const bilheteTransform = itemTransforms[bilheteId];

      if (!canhotoTransform || !bilheteTransform) {
        // Isso não deveria acontecer se os itens são sempre inicializados, mas é uma verificação de segurança.
        enqueueSnackbar('Erro: Posições de todos os Canhotos/Bilhetes não foram encontradas.', { variant: 'error' });
        setIsSubmitting(false);
        return;
      }

      printPositions.push({
        xCanhoto: Math.round(canhotoTransform.x), // Arredonda para inteiro, como int é esperado no backend
        yCanhoto: Math.round(canhotoTransform.y),
        xBilhete: Math.round(bilheteTransform.x),
        yBilhete: Math.round(bilheteTransform.y),
      });
    }

    try {
      const url = `https://multisorteios.dev/msrifaadmin/api/gerararquivoimpressao?token=${user.token}&codigo=${codigo}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printPositions), // <-- Envia a lista de posições aqui!
      });

      const result = await response.json();

      if (result.success) {
        enqueueSnackbar('Arquivo de impressão gerado com sucesso!', { variant: 'success' });
        setCodigo('');
      } else {
        enqueueSnackbar(result.errorMessage || 'Erro desconhecido ao gerar arquivo.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro na chamada da API de geração de arquivo:', error);
      enqueueSnackbar('Não foi possível conectar ao servidor para gerar o arquivo.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom component="h1">
        Construtor de Layout
      </Typography>

      {!panelConfig ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" onClick={handleOpenModal}>
            Configurar Layout
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Painel de Layout ({panelConfig.orientation === 'retrato' ? 'Retrato' : 'Paisagem'})
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Arraste os {panelConfig.numElements} elementos abaixo.
          </Typography>

          <Paper
            sx={{
              p: 0,
              mt: 2,
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
                disabled={codigo.length !== 5 || isSubmitting || !panelConfig} // Desabilita se o layout não estiver configurado
                sx={{ height: '56px' }}
              >
                {isSubmitting ? <MuiCircularProgress size={24} color="inherit" /> : 'Gerar Arquivo'}
              </Button>
            </Box>
          </Paper>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setPanelConfig(null)}>
              Resetar Configuração
            </Button>
          </Box>
        </Box>
      )}

      {/* Modal do Formulário (sem alterações) */}
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
          >
            Confirmar
          </Button>
        </Box>
      </Modal>
    </Layout>
  );
};

export default Builder;