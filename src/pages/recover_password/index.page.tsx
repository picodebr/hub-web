import { TextInput } from '@/components/Inputs/Text';
import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { AiOutlineMail } from 'react-icons/ai';
import { useAsyncCallback } from '@/_base/hooks';

const Recover: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = useAsyncCallback(async () => {
    if (!email) {
      setEmailError('Esse campo é obrigatório');
      return;
    }
    setEmailError('');
}, []);
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
      <Link 
        href='/help'
        width='100%'>
        <Flex padding="12px 0 0 0" width="100%" color="text.lightGray" align="left" gap="8px" >
        <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
        <Text textAlign='left'>Voltar</Text>
        </Flex>{' '}
      </Link>
      {/*Botão de voltar */}
      <Flex direction="column" gap="8px">
        <Text fontWeight="600" fontSize="20px" color="text.black">
          Recupere a sua senha
        </Text>
        <Text color="text.gray">Um código de verificação será enviado para o seu e-mail e você poderá recuperar a sua senha</Text>
      </Flex>
      <Flex //Inputs
        direction="column"
        width="100%"
        gap='6px'
      >
        <TextInput
          leftElement={<AiOutlineMail style={{ margin: '10px 8px 10px 14px'}}/>}
          value={email}
          onInputChange={(value) => setEmail(value)}
          label="E-mail"
          color='text.gray700'
          padding='10px 14px 10px 8px'
          placeholder="Informe seu e-mail"
          error={emailError}
        />
        {/* <Text
            padding='6px 0 0 0'
            textAlign="left"
            color="status.error"
            fontSize="14px"
            textDecoration="none"
          >
            Esse e-mail não possui cadastro
          </Text> */}
      </Flex>

      <Flex
      width='100%'
      textAlign='right'
      display='column'>
        <Link href="/no_email">
          <Text
            textAlign="right"
            color="red.200"
            fontSize="12.5px"
            cursor="pointer"
            textDecoration="underline"
            _hover={{ filter: 'brightness(0.8)' }}
          >
            Não tenho um e-mail
          </Text>
        </Link>
      </Flex>
      
      <Link //Enviar código
        href="/support"
        width="100%"
      >
        <Flex color="text.white" align="center" justify="center" borderRadius="8px" padding="10px 18px" bg="secondary">
          <Text fontWeight="600">Enviar código</Text>
        </Flex>
      </Link>
    </Flex>
  );
};

export default Recover;