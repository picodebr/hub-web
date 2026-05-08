import React, { useRef } from 'react';
import { PlusCircle, Trash2, Video, Upload } from 'lucide-react';
import { Box, Flex, Text, Heading, Button, Input, Image, IconButton } from '@chakra-ui/react';
import { keyframes as emotionKeyframes } from '@emotion/react';
import { useVisionLabStore, VisionLabClassData } from '@/_base/hooks';
import { extractFeatures } from '@/_base/lib/ml';

// ==========================================
// ANIMAÇÕES
// ==========================================
const popIn = emotionKeyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;
const pulse = emotionKeyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ==========================================
// PALETA DE CORES (Extraída do seu CSS)
// ==========================================
const piBlue = '#0052CC';
const piBlueDark = '#0747A6';
const piGreen = '#10B981';
const piYellow = '#FACC15';

// Estilo customizado de Scrollbar para usar na prop "sx"
const customScrollbar = {
  '&::-webkit-scrollbar': { width: '6px', height: '6px' },
  '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb:hover': { background: '#94a3b8' },
};

// ==========================================
// COMPONENTE: ClassManager
// ==========================================
export function ClassManager() {
  const { classes, addClass } = useVisionLabStore();

  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius="24px"
      p={5}
      boxShadow="0 20px 25px -5px rgba(226, 232, 240, 0.5)"
      border="1px solid"
      borderColor="gray.100"
      flex={1}
      position="relative"
      overflow="hidden"
      fontFamily="Poppins"
    >
      {/* Header */}
      <Flex align="center" gap={3} mb="1rem">
        <Box w="10px" h="10px" borderRadius="full" bg={piBlue} animation={`${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`} />
        <Text size="md" fontWeight="black" color="gray.800" letterSpacing="tight">
          Aprendizado
        </Text>
      </Flex>

      {/* Classes Container */}
      <Flex direction="column" flex={1} overflowY="auto" gap={5} pr={2} sx={customScrollbar}>
        {classes.map((cls, index) => (
          <ClassCard key={cls.id} classData={cls} index={index} />
        ))}
      </Flex>

      {/* Add Class */}
      <Box pt={4} borderTop="1px solid" borderColor="gray.100" mt={2}>
        <Button
          w="full"
          bg="gray.50"
          variant="unstyled"
          border="2px dashed"
          borderColor="gray.300"
          color="gray.500"
          py={6}
          borderRadius="xl"
          fontWeight="bold"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          transition="all 0.2s"
          role="group"
          _hover={{ bg: 'white', borderColor: piBlue, color: piBlue }}
          onClick={addClass}
        >
          <Box as="span" transition="transform 0.2s" _groupHover={{ transform: 'scale(1.1)' }}>
            <PlusCircle size={20} />
          </Box>
          Adicionar Outra Classe
        </Button>
      </Box>
    </Flex>
  );
}

// ==========================================
// COMPONENTE: ClassCard
// ==========================================
interface ClassCardProps {
  classData: VisionLabClassData;
  index: number;
}

export function ClassCard({ classData, index }: ClassCardProps) {
  const { classes, updateClassName, removeClass, removeSample, addSample, openWebcamModal, openConfirmModal } = useVisionLabStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lógica de Cores Dinâmicas
  const focusBorderColors = [piBlue, piGreen, piYellow];
  const borderColors = [piYellow, piGreen, piBlue, piBlueDark];

  const activeFocusColor = focusBorderColors[index % focusBorderColors.length];
  const activeBorder = borderColors[index % borderColors.length];

  const btnBg = index % 2 === 0 ? 'blue.50' : 'green.50';
  const btnColor = index % 2 === 0 ? piBlue : piGreen;

  const hasSamples = classData.samples.length > 0;

  const handleDeleteClassClick = () => {
    if (classes.length <= 2) {
      openConfirmModal(classData.id, 'info_min_classes');
    } else {
      openConfirmModal(classData.id, 'remove');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await new Promise<void>((resolve) => {
        const img = new window.Image();
        const url = URL.createObjectURL(file);
        img.onload = async () => {
          try {
            const { activation, thumbnail } = await extractFeatures(img, false);
            addSample(classData.id, thumbnail, activation);
          } catch (err) {
            console.error('Erro ao processar imagem:', err);
          }
          URL.revokeObjectURL(url);
          resolve();
        };
        img.src = url;
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Flex
      direction="column"
      justify="space-between"
      bg="white"
      border="2px solid"
      borderColor={activeBorder}
      borderRadius="xl"
      p={{ base: 2, sm: 3 }}
      position="relative"
      transition="all 0.2s"
      boxShadow="sm"
      // minH={{ base: '140px', sm: '160px' }}
      h="fit-content"
      _hover={{ borderWidth: '4px', boxShadow: 'md', p: { base: '6px', sm: '10px' } }} // Ajuste de padding para não quebrar o layout quando a borda engrossa
    >
      {/* Header do Card */}
      <Flex justify="space-between" align="center">
        <Box
          flex={1}
          mr={2}
          px={2}
          py={1}
          bg="gray.50"
          borderRadius="lg"
          border="1px solid transparent"
          transition="colors 0.2s"
          _focusWithin={{ bg: 'white', borderColor: activeFocusColor }}
        >
          <Input
            variant="unstyled"
            value={classData.name}
            onChange={(e) => updateClassName(classData.id, e.target.value)}
            fontSize="xs"
            fontWeight="black"
            color="gray.700"
            w="full"
            placeholder="Nome"
            _placeholder={{ color: 'gray.400' }}
            letterSpacing="tighter"
          />
        </Box>

        <IconButton
          aria-label="Remover Classe"
          icon={<Trash2 size={16} />}
          size="sm"
          variant="ghost"
          color="gray.300"
          _hover={{ color: 'red.500', bg: 'red.50' }}
          onClick={handleDeleteClassClick}
          title={classes.length <= 2 ? 'Limpar' : 'Remover'}
        />
      </Flex>

      {/* Conteúdo do Card */}
      <Flex direction="column" flex={1}>
        {!hasSamples ? (
          <Flex direction="column" gap={2}>
            <Flex gap={1.5}>
              <Button
                flex={1}
                bg={btnBg}
                color={btnColor}
                fontSize="10px"
                fontWeight="black"
                letterSpacing="wider"
                gap={1.5}
                _hover={{ bg: btnColor, color: 'white' }}
                onClick={() => openWebcamModal(classData.id)}
              >
                <Video size={16} /> Webcam
              </Button>
              <Button
                flex={1}
                bg="gray.100"
                color="gray.600"
                fontSize="10px"
                fontWeight="black"
                letterSpacing="wider"
                gap={1.5}
                _hover={{ bg: 'gray.200' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} /> Arquivo
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2} letterSpacing="wide" px={1}>
              {classData.samples.length} Exemplos
            </Text>

            <Flex gap={3} align="start">
              {/* Botões laterais menores */}
              <Flex direction="column" gap={1.5}>
                <IconButton
                  aria-label="Webcam"
                  icon={<Video size={14} />}
                  size="sm"
                  bg="gray.50"
                  color="gray.400"
                  border="1px solid"
                  borderColor="gray.100"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => openWebcamModal(classData.id)}
                />
                <IconButton
                  aria-label="Arquivo"
                  icon={<Upload size={14} />}
                  size="sm"
                  bg="gray.50"
                  color="gray.400"
                  border="1px solid"
                  borderColor="gray.100"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => fileInputRef.current?.click()}
                />
              </Flex>

              {/* Lista de Thumbnails */}
              <Flex flex={1} gap={2} overflowX="auto" pb={2} sx={customScrollbar}>
                {classData.samples.map((sample) => (
                  <Box
                    key={sample.id}
                    position="relative"
                    w={{ base: '40px', sm: '45px' }}
                    h={{ base: '40px', sm: '45px' }}
                    flexShrink={0}
                    borderRadius="lg"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="gray.100"
                    boxShadow="sm"
                    cursor="pointer"
                    animation={`${popIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`}
                    role="group"
                    onClick={() => removeSample(classData.id, sample.id)}
                  >
                    <Image src={sample.thumbnail} alt="Amostra" w="full" h="full" objectFit="cover" />
                    {/* Overlay Vermelho de Lixeira ao passar o mouse */}
                    <Flex
                      position="absolute"
                      inset={0}
                      bg="rgba(239, 68, 68, 0.8)"
                      align="center"
                      justify="center"
                      opacity={0}
                      transition="opacity 0.2s"
                      _groupHover={{ opacity: 1 }}
                    >
                      <Trash2 size={24} color="white" />
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </Flex>
          </Box>
        )}
      </Flex>

      {/* Input de arquivo invisível */}
      <Input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleFileUpload} display="none" />
    </Flex>
  );
}
