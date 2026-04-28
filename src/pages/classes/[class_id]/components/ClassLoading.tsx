import React from 'react';
import { Flex, Text, Icon, Box } from '@chakra-ui/react';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { motion } from 'framer-motion';
import { FaGraduationCap } from 'react-icons/fa';

interface IClassLoadingProps {
  className?: string;
}

export const ClassLoading: React.FC<IClassLoadingProps> = ({ className = 'selecionada' }) => {
  const { colorMode } = useDarkMode();

  // Cores seguindo o padrão do seu tema
  const bgCard = colorMode === 'light' ? 'white' : 'gray800';
  const textColor = colorMode === 'light' ? 'gray800' : 'white';
  const subTextColor = colorMode === 'light' ? 'gray500' : 'gray400';

  return (
    <Flex
      w="100%"
      h="100%"
      minH="400px" // Garante um tamanho mínimo bonito na tela
      align="center"
      justify="center"
      direction="column"
      bg={bgCard}
      borderRadius="2xl"
    >
      {/* 1. Ícone Pulsante */}
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <Flex
          bg={colorMode === 'light' ? 'primary50' : 'rgba(255, 255, 255, 0.05)'}
          p="1.5rem"
          borderRadius="full"
          border="1px solid"
          borderColor={colorMode === 'light' ? 'primary100' : 'gray700'}
        >
          <Icon as={FaGraduationCap} fontSize="3.5rem" color="primary500" />
        </Flex>
      </motion.div>

      {/* 2. Textos Explicativos */}
      <Flex direction="column" align="center" mt="2rem" gap="0.5rem">
        <Text fontSize="22px" fontWeight="800" color={textColor} textAlign="center">
          Preparando o ambiente...
        </Text>
        <Text fontSize="15px" color={subTextColor} textAlign="center" maxW="350px">
          Aguarde enquanto os dados da turma{' '}
          <Text as="span" fontWeight="700" color="primary500">
            {className}
          </Text>{' '}
          são carregados.
        </Text>
      </Flex>

      {/* 3. Dots (Pontinhos animando em onda) */}
      <Flex gap="0.5rem" mt="2rem">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          >
            <Box w="10px" h="10px" borderRadius="full" bg="primary400" />
          </motion.div>
        ))}
      </Flex>
    </Flex>
  );
};
