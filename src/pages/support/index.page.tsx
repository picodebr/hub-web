import { ReactNode, useState } from 'react';
import { FiChevronLeft, FiUser } from 'react-icons/fi';
import { GiCheckMark } from 'react-icons/gi';

import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { EMPTY_SUPPORT_DATA, ISupportData, supportSchema } from '@/_base/interfaces/help';
import { TextInput } from '@/components/Inputs/Text';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';

type PageStepsType = 'FORM' | 'SENT';

const Support: React.FC = () => {
  const [step, setStep] = useState<PageStepsType>('FORM'); //aqui ele inicia

  const { errors, onInputChange, data, submit } = useInputHandler<ISupportData>({ data: EMPTY_SUPPORT_DATA, schema: supportSchema });

  const sendSupportMessage = useAsyncCallback(async () => {
    // TODO: send request to backend
    await new Promise((resolve) => {
      setTimeout(() => {
        setStep('SENT');
        resolve(true);
      }, 2000);
    });
  }, []);

  const PageStepElement: Record<PageStepsType, ReactNode> = {
    FORM: (
      <Flex
        bgColor="white"
        width="400px"
        height="fit-content"
        margin="auto"
        borderRadius="12px"
        
        align="center"
        padding="24px"
        direction="column"
        gap="20px"
      >
        <Logo />
        <Link href="/help" width="100%">
          <Flex padding="12px 0 0 0" width="100%" color="gray300" align="left" gap="8px">
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
            onInputChange={(value) => onInputChange('description', value)}
            placeholder="Fale sobre o problema..."
            label="Descrição"
            resize="none"
          />
        </Flex>
        <Flex
          w="100%"
          color="white"
          align="center"
          justify="center"
          borderRadius="8px"
          padding="10px 18px"
          bg="primary900"
          cursor="pointer"
          onClick={() => submit(sendSupportMessage)}
        >
          <Text fontWeight="600">Enviar</Text>
        </Flex>
      </Flex>
    ),
    SENT: (
      <Flex
        bgColor="white"
        width="400px"
        height="fit-content"
        margin="auto"
        borderRadius="12px"
        
        align="center"
        padding="24px"
        direction="column"
      >
        <Logo />
        <Flex width="100%" marginTop="32px" gap="20px">
          <GiCheckMark fontSize="40px" style={{ backgroundColor: '#E0EEFF', color: '#6699FF', borderRadius: '50%', padding: '8px' }} />
        </Flex>
        <Flex padding="20px 0" width="100%" color="gray900" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Enviado com sucesso!
            </Text>
            <Text color="gray500">Sua mensagem foi enviada e recebida pela nossa equipe e dentro de 24h iremos te retornar no e-mail informado</Text>
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
    ),
  };

  return (
    <Flex m="auto" mx={{ base: '1rem', md: 'auto' }}>
      {PageStepElement[step]}
    </Flex>
  );
};

export default Support;
