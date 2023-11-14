import { TextInput } from '@/components/Inputs/Text';
import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FiChevronLeft, FiUser } from 'react-icons/fi';

const RecoverWithoutEmail: React.FC = () => {
  const [username, setUsername] = useState('');
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
      </Flex>{' '}
      {/*Botão de voltar */}
      <Flex direction="column" gap="8px">
        <Text fontWeight="600" fontSize="20px" color="text.black">
          Recupere a sua senha
        </Text>
        <Text color="text.gray">Informe o nome de usuário e iremos enviar uma solicitação de redefinição de senha para o seu professor</Text>
      </Flex>
      <Flex //Inputs
        direction="column"
        width="100%"
        gap='6px'
      >
        <TextInput
          leftElement={<FiUser style={{ margin: '10px 8px 10px 14px'}}/>}
          value={username}
          onInputChange={(value) => setUsername(value)}
          label="Nome de usuário"
          color='text.gray700'
          padding='10px 14px 10px 8px'
          placeholder="Informe seu nome de usuário"
        />
        {/* <Text
            padding='6px 0 0 0'
            textAlign="left"
            color="status.error"
            fontSize="14px"
            textDecoration="none"
          >
            Esse nome de usuário não possui cadastro
          </Text> */}
      </Flex>

      <Flex
      width='100%'
      textAlign='right'
      display='column'>
        <Link href="/no_email">
          <Text
            marginTop='-12px'
            marginBottom='8px'
            textAlign="right"
            color="red.200"
            fontSize="12.5px"
            cursor="pointer"
            textDecoration="underline"
            _hover={{ filter: 'brightness(0.8)' }}
          >
            Vou informar um e-mail
          </Text>
        </Link>
      </Flex>
      
      <Link //Enviar código
        href="/support"
        width="100%"
      >
        <Flex color="text.white" align="center" justify="center" borderRadius="8px" padding="10px 18px" bg="secondary">
          <Text fontWeight="600">Enviar</Text>
        </Flex>
      </Link>
    </Flex>
  );
};

export default RecoverWithoutEmail;