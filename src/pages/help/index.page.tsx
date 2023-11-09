import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Help: React.FC = () => {
  return (
    <Flex
      backgroundColor="bg.white"
      width="400px"
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
      <Flex padding="12px 0" width="100%" color="text.lightGray" align="center" gap="8px">
        <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
        Voltar
      </Flex>
      <Flex direction="column" gap="8px">
        <Text fontWeight="600" fontSize="20px" color="text.black">
          Como nós podemos te ajudar?
        </Text>
        <Text color="text.gray">Escolha uma das opções abaixo para ser redirecionado</Text>
      </Flex>
      <Link //Esqueci minha senha
        href="/recover_password"
        width="100%"
      >
        <Flex color="text.white" align="center" justify="space-between" borderRadius="8px" padding="10px 18px" bg="primary">
          <Text fontWeight="600">Esqueci minha senha</Text>
          <FiChevronRight />
        </Flex>
      </Link>
      <Link //Suporte PiCode
        href="/support"
        width="100%"
      >
        <Flex color="text.primary" align="center" justify="space-between" borderRadius="8px" padding="10px 18px" bg="primaryLight">
          <Text fontWeight="600">Suporte PiCode</Text>
          <FiChevronRight />
        </Flex>
      </Link>
    </Flex>
  );
};

export default Help;
