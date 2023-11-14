import { useAsyncCallback } from '@/_base/hooks';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { TextInput } from '@/components/Inputs/Text';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';
import { ReactNode, SetStateAction, useState } from 'react';
import { FiChevronLeft, FiUser } from 'react-icons/fi';

type PageStepType = 'FORM' | 'MESSAGE_SENT';

const Support: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const funcaozinhaquedemora = async () => {
    await new Promise((res) => {
      setTimeout(() => {
        setPageStep('MESSAGE_SENT');
        res(true);
      }, 5000);
    });
  };

  const router = useCustomRouter();
 
  const [pageStep, setPageStep] = useState<PageStepType>('FORM');

  const handleSubmit = useAsyncCallback(async () => {
    if (!description) {
      setDescriptionError('Esse campo é obrigatório');
      return;
    }
    if (description.length < 15) {
      setDescriptionError('Mínimo de 15 caracteres');
      return;
    }
    setDescriptionError('');

    if (!username) {
      setUsernameError('Esse campo é obrigatório');
      return;
    }
    if (username.length < 6) {
      setUsernameError('Nome de usuário inválido');
      return;
    }
    setUsernameError('');

    await funcaozinhaquedemora();
  }, []);

  const PageStepElement: Record<PageStepType, ReactNode> = {
    FORM: (
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
        <Flex padding="12px 0 0 0" width="100%" color="text.lightGray" align="left" gap="8px" cursor="pointer" onClick={() => router.push('/login')}>
          <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
          <Text textAlign="left">Voltar</Text>
        </Flex>
        <Flex //Inputs
          direction="column"
          width="100%"
          gap="12px"
        >
          <TextInput
            value={username}
            onInputChange={(value) => setUsername(value)}
            label="Nome de Usuário"
            leftElement={<FiUser />}
            error={usernameError}
          />
          <TextInput value={email} onInputChange={(value) => setEmail(value)} label="E-mail" />
          <TextAreaInput
            value={description}
            onInputChange={(value: SetStateAction<string>) => setDescription(value)}
            placeholder="Fale sobre o problema..."
            label="Descrição"
            resize="none"
            error={descriptionError}
          />
        </Flex>
        <Flex
          color="text.white"
          align="center"
          justify="center"
          borderRadius="8px"
          padding="10px 18px"
          bg="secondary"
          cursor="pointer"
          onClick={() => handleSubmit()}
        >
          <Text fontWeight="600">Enviar</Text>
        </Flex>
      </Flex>
    ),
    MESSAGE_SENT: (
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
      >
        <Logo />
        <Link href="/help" width="100%">
          <Flex padding="12px 0 0 0" width="100%" color="text.lightGray" align="left" gap="8px">
            <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
            <Text textAlign="left">Voltar</Text>
          </Flex>{' '}
        </Link>
        <Flex padding="20px 0" width="100%" color="text.lightGray" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="text.black">
              Enviado com sucesso!
            </Text>
            <Text color="text.gray">
              Sua mensagem foi enviada e recebida pela nossa equipe e dentro de 24h iremos te retornar no e-mail informado
            </Text>
          </Flex>
        </Flex>
        <Link //Button "voltar" on message sent
          href="/login"
          width="100%"
        >
          <Flex color="text.white" align="center" justify="center" borderRadius="8px" padding="10px 18px" bg="secondary">
            <Text fontWeight="600">Voltar</Text>
          </Flex>
        </Link>
      </Flex>
    ),
  };

  return PageStepElement[pageStep];
};

export default Support;