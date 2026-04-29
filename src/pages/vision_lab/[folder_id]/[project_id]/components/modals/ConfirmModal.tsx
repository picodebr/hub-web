import { Trash2, AlertCircle } from 'lucide-react';
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { keyframes as emotionKeyframes } from '@emotion/react';
import { useVisionLabStore } from '@/_base/hooks';

// ==========================================
// ANIMAÇÕES
// ==========================================
const popIn = emotionKeyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

// ==========================================
// PALETA DE CORES E ESTILOS
// ==========================================
const piBlue = '#0052CC';

// ==========================================
// COMPONENTE: ConfirmModal
// ==========================================
export function VisionLabConfirmModal() {
  const { classes, activeConfirmModal, closeConfirmModal, removeClass, removeSample } = useVisionLabStore();

  if (!activeConfirmModal) return null;

  const { classId, action } = activeConfirmModal;
  const classData = classId !== null ? classes.find((c) => c.id === classId) : null;

  const isError = action.startsWith('error_') || action === 'info_min_classes';

  const handleConfirm = () => {
    if (classId === null) return;

    if (action === 'clear' && classData) {
      classData.samples.forEach((s) => removeSample(classId, s.id));
    } else if (action === 'remove') {
      removeClass(classId);
    }
    closeConfirmModal();
  };

  return (
    <Flex position="fixed" inset={0} zIndex={100} align="center" justify="center" p={4} fontFamily='"Nunito", "Poppins", sans-serif'>
      {/* Backdrop com Blur */}
      <Box
        position="absolute"
        inset={0}
        bg="rgba(15, 23, 42, 0.4)" // slate-900/40
        backdropFilter="blur(4px)"
        transition="opacity 0.2s"
        onClick={closeConfirmModal}
      />

      {/* Modal Box */}
      <Box
        position="relative"
        bg="white"
        borderRadius="2rem"
        p={{ base: 6, sm: 8 }}
        w="full"
        maxW="sm"
        animation={`${popIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`}
        border="4px solid"
        borderColor="gray.50"
        // Combinando shadow-2xl do tailwind com o ring-4
        boxShadow="0 0 0 4px rgba(241, 245, 249, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      >
        {/* Ícone */}
        <Flex w={16} h={16} borderRadius="2xl" align="center" justify="center" mb={6} bg={isError ? 'blue.50' : 'red.50'}>
          {isError ? <AlertCircle size={32} color={piBlue} /> : <Trash2 size={32} color="#EF4444" />}
        </Flex>

        {/* Título */}
        <Heading as="h3" fontSize={{ base: 'xl', sm: '2xl' }} fontWeight="black" color="gray.800" mb={2}>
          {action === 'error_no_samples'
            ? 'Faltam exemplos!'
            : action === 'error_min_classes_train'
              ? 'Treinamento impossível'
              : action === 'info_min_classes'
                ? 'Ação não permitida'
                : action === 'clear'
                  ? 'Limpar as Fotos?'
                  : 'Remover Classe?'}
        </Heading>

        {/* Mensagem */}
        <Text color="gray.500" mb={8} fontWeight="medium" fontSize={{ base: 'sm', sm: 'base' }} lineHeight="snug">
          {action === 'error_no_samples'
            ? 'Todas as classes precisam ter pelo menos um exemplo ou foto para que eu possa aprender!'
            : action === 'error_min_classes_train'
              ? 'Para criar uma inteligência, precisamos comparar pelo menos duas coisas diferentes com exemplos!'
              : action === 'info_min_classes'
                ? 'Não é possível deixar menos de 2 classes. Para criar a inteligência, precisamos comparar pelo menos duas coisas diferentes!'
                : action === 'clear'
                  ? 'Como você só tem 2 classes, podemos apenas apagar todas as fotos dela. Tem certeza?'
                  : `Tem certeza que deseja jogar a classe "${classData?.name}" fora? Todas as fotos dela serão perdidas.`}
        </Text>

        {/* Botões */}
        <Flex gap={3}>
          {isError ? (
            <Button
              flex={1}
              px={4}
              py={3}
              h="auto"
              bg={piBlue}
              color="white"
              fontWeight="bold"
              borderRadius="xl"
              transition="colors 0.2s"
              boxShadow="0 10px 15px -3px rgba(0, 82, 204, 0.3)"
              _hover={{ bg: 'blue.600' }}
              _active={{ transform: 'scale(0.95)' }}
              onClick={closeConfirmModal}
            >
              Entendi
            </Button>
          ) : (
            <>
              <Button
                flex={1}
                px={4}
                py={3}
                h="auto"
                bg="gray.100"
                color="gray.600"
                fontWeight="bold"
                borderRadius="xl"
                transition="colors 0.2s"
                _hover={{ bg: 'gray.200' }}
                _active={{ transform: 'scale(0.95)' }}
                onClick={closeConfirmModal}
              >
                Cancelar
              </Button>
              <Button
                flex={1}
                px={4}
                py={3}
                h="auto"
                bg="red.500"
                color="white"
                fontWeight="bold"
                borderRadius="xl"
                transition="colors 0.2s"
                boxShadow="0 10px 15px -3px rgba(239, 68, 68, 0.3)"
                _hover={{ bg: 'red.600' }}
                _active={{ transform: 'scale(0.95)' }}
                onClick={handleConfirm}
              >
                Sim, {action === 'clear' ? 'Limpar' : 'Remover'}
              </Button>
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}
