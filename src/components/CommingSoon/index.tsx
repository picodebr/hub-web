import { Flex, Text } from '@chakra-ui/react';
import { FaTools } from 'react-icons/fa';

export const CommingSoon: React.FC = () => {
  return (
    <Flex
      position="absolute"
      top="0"
      bottom="0"
      left="0"
      right="0"
      backdropFilter="blur(6px)"
      zIndex={9999}
      h="100%"
      w="100%"
      borderRadius="md"
      
    >
      <Flex
        margin="auto"
        padding="1rem"
        bg="white"
        borderRadius="md"
        gap="1rem"
        align="center"
        
        transition="0.12s"
        _hover={{ boxShadow: `lg` }}
      >
        <Text color="gray800">Disponível em breve...</Text>
        <FaTools fontSize="1.5rem" />
      </Flex>
    </Flex>
  );
};
