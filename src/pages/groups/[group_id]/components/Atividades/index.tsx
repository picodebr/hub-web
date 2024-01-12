import { Flex, Img, Text } from '@chakra-ui/react';
import { FiFileText } from 'react-icons/fi';

interface IProps {}

export const Activities: React.FC<IProps> = () => {
  return (
    <Flex direction="column" gap="24px" overflow="auto">
      <Flex
        w="220px"
        h="183px"
        p="12px"
        gap="4px"
        display="flex"
        direction="column"
        bg="white"
        borderRadius="10px"
        border="1px"
        borderColor="gray300"
        cursor="pointer"
        _hover={{ bg: 'gray50' }}
      >
        <Img src="/images/img.png"></Img>
        <Flex align="center" color="primary500" gap="4px" fontWeight="500">
          <FiFileText />
          Arquivo de Texto
        </Flex>
        <Text color="gray500" fontSize="13px">
          3 dias atrás
        </Text>
      </Flex>
    </Flex>
  );
};
