import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { EMPTY_SUPPORT_DATA, ISupportData, supportSchema } from '@/_base/interfaces/help';
import { TextInput } from '@/components/Inputs/Text';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';
import { ReactNode, SetStateAction, useState } from 'react';
import { FiChevronLeft, FiUser } from 'react-icons/fi';

type PageStepsType = 'FORM' | 'SENT';

const Support: React.FC = () => {
  const [step, setStep] = useState<PageStepsType>('FORM');

  const { errors, onInputChange, data, submit } = useInputHandler<ISupportData>();

  const handleSentTrouble = useAsyncCallback(async () => {
    // TODO: send request to backend
    await new Promise((resolve) => {
      setTimeout(() => {
        setStep('SENT');
        resolve(true);
      }, 5000);
    });
  }, []);

  const PageStepElement: Record<PageStepsType, ReactNode> = {
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
        <Link href="/login" width="100%">
          <Flex padding="12px 0 0 0" width="100%" color="text.lightGray" align="left" gap="8px">
            <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
            <Text textAlign="left">Voltar</Text>
          </Flex>{' '}
        </Link>
        <Flex //Inputs
          direction="column"
          width="100%"
          gap="12px"
        >
          <TextInput
            value={data.username}
            error={errors.username}
            onInputChange={(value) => onInputChange('username', value)}
            label="Nome de Usuário"
            leftElement={<FiUser />}
          />
          <TextInput value={data.email} error={errors.email} onInputChange={(value) => onInputChange('email', value)} label="E-mail" />
          <TextAreaInput
            value={data.description}
            error={errors.description}
            onInputChange={(value: SetStateAction<string>) => onInputChange('description', value)}
            placeholder="Fale sobre o problema..."
            label="Descrição"
            resize="none"
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
          onClick={() => submit(handleSentTrouble)}
        >
          <Text fontWeight="600">Enviar</Text>
        </Flex>
      </Flex>
    ),
    SENT: (
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

  return PageStepElement[step];
};

export default Support;
