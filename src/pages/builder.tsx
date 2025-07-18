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
} from '@mui/material';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core';
import { CSS, Transform } from '@dnd-kit/utilities'; // <--- Importe Transform aqui!

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

// Componente Elemento Arrastável
interface DraggableItemProps {
    id: string; // ID único para o item arrastável
    content: string; // Conteúdo a ser exibido no item
    // Tipo da prop inicial agora é 'Transform'
    initialTransform: Transform; // <--- Alterado para Transform
}

function DraggableItem({ id, content, initialTransform }: DraggableItemProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
    });

    // Calcula a transformação final:
    // Se estiver arrastando (transform existe), combina a delta inicial com a delta atual da arrastada.
    // Se não estiver arrastando, usa apenas a delta inicial/acumulada.
    // Garante que scaleX e scaleY estejam sempre presentes.
    const finalTransform: Transform = transform
        ? {
            x: initialTransform.x + transform.x,
            y: initialTransform.y + transform.y,
            scaleX: initialTransform.scaleX, // Mantém o scaleX anterior
            scaleY: initialTransform.scaleY, // Mantém o scaleY anterior
        }
        : initialTransform;

    const style = {
        transform: CSS.Translate.toString(finalTransform), // Agora finalTransform é do tipo correto
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
                m: 1,
                border: '1px solid grey',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100px',
                height: '100px',
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

const Builder: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [numPositions, setNumPositions] = useState<number>(1);
    const [orientation, setOrientation] = useState<'retrato' | 'paisagem'>('retrato');

    const [panelConfig, setPanelConfig] = useState<{
        numElements: number;
        orientation: 'retrato' | 'paisagem';
    } | null>(null);

    // NOVO ESTADO: Armazena as transformações acumuladas de cada item.
    // O valor agora é do tipo 'Transform'
    const [itemTransforms, setItemTransforms] = useState<Record<string, Transform>>({}); // <--- Alterado para Transform

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setNumPositions(newValue as number);
    };

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrientation(event.target.value as 'retrato' | 'paisagem');
    };

    const handleSubmitForm = () => {
        setPanelConfig({
            numElements: numPositions * 2,
            orientation: orientation,
        });
        // Ao configurar o painel, resetamos as transformações de todos os itens
        setItemTransforms({});
        handleCloseModal();
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;

        setItemTransforms((prevTransforms) => {
            // Pega a transformação anterior ou inicializa com valores padrão (0,0,1,1)
            const prevTransform = prevTransforms[active.id] || { x: 0, y: 0, scaleX: 1, scaleY: 1 };
            return {
                ...prevTransforms,
                [active.id]: {
                    x: prevTransform.x + delta.x, // Acumula o movimento X
                    y: prevTransform.y + delta.y, // Acumula o movimento Y
                    scaleX: prevTransform.scaleX, // Mantém o scaleX (não há alteração de escala na arrastada)
                    scaleY: prevTransform.scaleY, // Mantém o scaleY (não há alteração de escala na arrastada)
                },
            };
        });
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
                            p: 2,
                            mt: 2,
                            border: '2px dashed grey',
                            minHeight: '400px',
                            position: 'relative',
                            overflow: 'hidden',
                            ...(panelConfig.orientation === 'retrato' && {
                                width: '300px',
                                minHeight: '400px',
                            }),
                            ...(panelConfig.orientation === 'paisagem' && {
                                width: '100%',
                                minHeight: '300px',
                            }),
                        }}
                    >
                        <DndContext onDragEnd={handleDragEnd}>
                            {Array.from({ length: panelConfig.numElements }).map((_, i) => (
                                <DraggableItem
                                    key={`item-${i}`}
                                    id={`item-${i}`}
                                    content={`Elemento ${i + 1}`}
                                    // Passa a transformação acumulada, ou a inicial padrão (0,0,1,1)
                                    initialTransform={itemTransforms[`item-${i}`] || { x: 0, y: 0, scaleX: 1, scaleY: 1 }} // <--- Alterado
                                />
                            ))}
                        </DndContext>
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