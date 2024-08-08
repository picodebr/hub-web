import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';

const Help: React.FC = () => {
  return (
    <Flex m="auto" mx={{ base: '1rem', md: 'auto' }}>
      <Flex
        bgColor="white"
        maxW="400px"
        width="100%"
        height="fit-content"
        margin="auto"
        borderRadius="12px"
        boxShadow="md"
        align="center"
        padding="24px"
        direction="column"
        gap="20px"
      >
        <Logo />
        <Link href="/login" width="100%">
          <Flex padding="12px 0" width="100%" color="gray300" align="center" gap="8px" cursor="pointer">
            <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
            <Text textAlign="left">Voltar</Text>
          </Flex>{' '}
        </Link>

        <Flex direction="column" gap="8px">
          <Text fontWeight="600" fontSize="20px" color="gray900">
            Como nós podemos te ajudar?
          </Text>
          <Text color="gray500">Escolha uma das opções abaixo para ser redirecionado</Text>
        </Flex>
        <Link //Esqueci minha senha
          href="/recover_password"
          width="100%"
        >
          <Flex color="white" align="center" justify="space-between" borderRadius="8px" padding="10px 18px" bg="primary700">
            <Text fontWeight="600">Esqueci minha senha</Text>
            <FiChevronRight />
          </Flex>
        </Link>
        <Link //Suporte PiCode
          href="/support"
          width="100%"
        >
          <Flex color="white" align="center" justify="space-between" borderRadius="8px" padding="10px 18px" bg="primary300">
            <Text fontWeight="600">Suporte PiCode</Text>
            <FiChevronRight />
          </Flex>
        </Link>
      </Flex>
    </Flex>
  );
};

export default Help;
