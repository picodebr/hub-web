import { HubUserType } from '@/_base/interfaces/user';
import { Flex, Link, Text } from '@chakra-ui/react';
import { GiCheckMark } from 'react-icons/gi';

interface IProps {
  userType?: HubUserType;
}

export const FinishStep: React.FC<IProps> = ({ userType }) => {
  return (
    <Flex direction="column" justify="space-between" h="100%">
      <Flex width="100%" marginTop="32px" gap="20px">
        <GiCheckMark fontSize="40px" style={{ backgroundColor: '#E0EEFF', color: '#6699FF', borderRadius: '50%', padding: '8px' }} />
      </Flex>
      <Flex padding="20px 0" width="100%" color="gray900" align="center" gap="8px">
        <Flex direction="column" gap="8px">
          <Text fontWeight="600" fontSize="20px" color="gray900">
            Cadastro realizado com sucesso
          </Text>
          {userType === `student` ? (
            <Text color="gray500">Parabéns! Seu cadastro foi realizado com sucesso. Agora você pode fazer o login para acessar sua conta</Text>
          ) : (
            <>
              <Text color="gray500">Agora seu cadastro será validado pela PiCode.</Text>
              <Text color="gray500">Mas não se preocupe, lhe enviaremos um e-mail com todos os detalhes 😉</Text>
            </>
          )}
        </Flex>
      </Flex>
      <Link //Button "voltar" on message sent
        href="/login"
        width="100%"
      >
        <Flex color="white" align="center" justify="center" borderRadius="8px" padding="10px 18px" bg="primary900">
          <Text fontWeight="600">Voltar</Text>
        </Flex>
      </Link>
    </Flex>
  );
};
