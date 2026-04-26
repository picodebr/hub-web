import { useState } from 'react';
import { Box, Flex, Text, Button } from '@chakra-ui/react';
import { keyframes as emotionKeyframes } from '@emotion/react';
import { BrainCircuit, Play } from 'lucide-react';
import { useVisionLabStore } from '@/_base/hooks';
import { trainModel } from '@/_base/lib/ml';

// 1. Definindo as animações em CSS-in-JS
const float = emotionKeyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const pulse = emotionKeyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
`;

export function TrainingPanel() {
  const { classes, isTraining, isTrained, trainingProgress, setTrainingState, openConfirmModal } = useVisionLabStore();

  // 2. Cores extraídas do seu CSS
  const piBlue = '#0052CC';
  const piBlueDark = '#0747A6';
  const piGreen = '#10B981';

  const handleTrain = async () => {
    // Validação
    const invalidClasses = classes.filter((c) => c.samples.length === 0);
    if (invalidClasses.length > 0) {
      openConfirmModal(null, 'error_no_samples');
      return;
    }
    if (classes.length < 2) {
      openConfirmModal(null, 'error_min_classes_train');
      return;
    }

    setTrainingState({ isTraining: true, trainingProgress: 'Preparando Dados...' });

    try {
      await new Promise((r) => setTimeout(r, 100));

      await trainModel(classes, (epoch, loss) => {
        setTrainingState({
          trainingProgress: `Época ${epoch + 1}/50 - Perda: ${loss.toFixed(4)}`,
        });
      });

      setTrainingState({ isTraining: false, isTrained: true, trainingProgress: 'Modelo Treinado!' });
    } catch (err) {
      console.error(err);
      setTrainingState({ isTraining: false, trainingProgress: 'Erro no treinamento' });
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      bg="white"
      p={6}
      borderRadius="32px"
      w="full"
      maxW="320px"
      position="relative"
      border="4px solid white"
      // box-shadow personalizado simulando shadow-2xl do tailwind + ring
      boxShadow="0 25px 50px -12px rgba(191, 219, 254, 0.4), 0 0 0 2px var(--chakra-colors-gray-100)"
      animation={`${float} 4s ease-in-out infinite`}
      fontFamily='"Nunito", "Poppins", sans-serif' // Aplicando a fonte diretamente
    >
      {/* Ícone */}
      <Box bg="blue.50" p={4} borderRadius="2xl" mb={4}>
        <BrainCircuit size={40} color={piBlue} />
      </Box>

      {/* Textos */}
      <Text fontSize="xl" fontWeight="black" color="gray.800" mb={1}>
        Treinamento
      </Text>

      <Text
        color="gray.400"
        fontSize="10px"
        fontWeight="bold"
        mb={5}
        textAlign="center"
        px={2}
        lineHeight="tight"
        textTransform="uppercase"
        letterSpacing="widest"
      >
        Ensine o computador!
      </Text>

      {/* Botão Dinâmico */}
      <Button
        w="full"
        py={6} // Equivalente ao py-3 do tailwind num botão
        borderRadius="xl"
        fontSize="sm"
        fontWeight="black"
        color="white"
        transition="all 0.2s"
        gap={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={handleTrain}
        isDisabled={isTraining}
        // Lógica de cores baseada no estado
        bg={isTraining ? 'gray.400' : isTrained ? 'green.500' : piBlue}
        boxShadow={isTraining ? 'none' : isTrained ? '0 10px 15px -3px rgba(34, 197, 94, 0.3)' : '0 10px 15px -3px rgba(0, 82, 204, 0.3)'}
        _hover={{
          bg: isTraining ? 'gray.400' : isTrained ? 'green.600' : piBlueDark,
          transform: isTraining ? 'none' : 'scale(1.05)',
        }}
        _active={{
          transform: isTraining ? 'none' : 'scale(0.95)',
        }}
        _disabled={{
          bg: 'gray.400',
          cursor: 'not-allowed',
          opacity: 1,
        }}
      >
        {!isTraining && <Play size={24} />}
        {isTraining ? trainingProgress : isTrained ? 'TREINAR NOVAMENTE' : 'TREINAR AGORA'}
      </Button>

      {/* Barra de Progresso */}
      {isTraining && (
        <Box w="full" mt={4} bg="gray.100" borderRadius="full" h="8px" overflow="hidden">
          <Box bg={piBlue} h="full" w="full" animation={`${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`} />
        </Box>
      )}

      {/* Mensagem de Sucesso */}
      {isTrained && !isTraining && (
        <Text mt={4} fontSize="sm" fontWeight="bold" color="green.500">
          {trainingProgress}
        </Text>
      )}
    </Flex>
  );
}
