import React, { ElementType, ReactNode } from 'react';
import { Flex, Text, Icon, Box } from '@chakra-ui/react';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { motion } from 'framer-motion';
import { LucideClockFading } from 'lucide-react';

interface IPageLoadingProps {
  isLoading: boolean;
  content?: ReactNode;
  CustomIcon?: ElementType;
}

export const PageLoading: React.FC<IPageLoadingProps> = ({ content, isLoading, CustomIcon }) => {
  const { colorMode } = useDarkMode();

  const bgCard = colorMode === 'light' ? 'white' : 'gray800';
  const textColor = colorMode === 'light' ? 'gray800' : 'white';

  return !isLoading ? null : (
    <Flex
      position="absolute"
      m="1rem 5rem"
      top="0"
      left="0"
      right="0"
      bottom="0"
      minH="400px" // Garante um tamanho mínimo bonito na tela
      align="center"
      justify="center"
      direction="column"
      bg={bgCard}
      borderRadius="2xl"
      zIndex="999"
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
          <Icon as={CustomIcon || LucideClockFading} fontSize="3.5rem" color="primary500" />
        </Flex>
      </motion.div>

      {/* 2. Textos Explicativos */}
      <Flex direction="column" align="center" mt="2rem" gap="0.5rem">
        <Text fontSize="22px" fontWeight="800" color={textColor} textAlign="center">
          Preparando o ambiente...
        </Text>
        {content && content}
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
