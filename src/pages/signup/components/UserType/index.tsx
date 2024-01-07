import { Flex, Link, Text } from '@chakra-ui/react';

import { HubUserType } from '@/_base/interfaces/user';

interface IProps {
  onUserTypeChange: (type: HubUserType) => void;
}

export const UserTypeStep: React.FC<IProps> = ({ onUserTypeChange }) => {
  return (
    <Flex direction="column" h="100%" align="center" justify="space-between">
      <Flex color="gray400" whiteSpace="nowrap" gap="0.25rem" fontSize="14px" padding="32px 0">
        <Text>Já tem uma conta?</Text>
        <Link href="/login" width="100%" color="primary900" textDecoration="underline">
          Faça o Login
        </Link>
      </Flex>
      <Flex padding="20px 0" width="100%" color="gray900" align="center" gap="8px">
        <Flex direction="column" gap="8px">
          <Text fontWeight="600" fontSize="20px" color="gray900">
            Eu sou...
          </Text>
          <Text color="gray500" fontSize="15px">
            Selecione o modo que você deseja se cadastrar
          </Text>
        </Flex>
      </Flex>
      <Flex gap="24px">
        <Flex
          direction="column"
          h="178px"
          w="170px"
          bg="gray100"
          borderRadius="14px"
          overflow="hidden"
          cursor="pointer"
          _hover={{ filter: 'brightness(0.95)' }}
          onClick={() => onUserTypeChange('student')}
        >
          <Flex className="IMAGEM DO TIPO DE USUÁRIO SELECIONADO" flex="1" />
          <Flex h="28px" bg="primary300" color="gray900" align="center" justify="center">
            Aluno
          </Flex>
        </Flex>
        <Flex
          direction="column"
          h="178px"
          w="170px"
          bg="gray100"
          borderRadius="14px"
          overflow="hidden"
          cursor="pointer"
          _hover={{ filter: 'brightness(0.95)' }}
          onClick={() => onUserTypeChange('teacher')}
        >
          <Flex className="IMAGEM DO TIPO DE USUÁRIO SELECIONADO" flex="1" />
          <Flex h="28px" bg="primary400" color="gray800" align="center" justify="center">
            Professor
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
