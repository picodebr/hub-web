import { FiChevronLeft, FiUser } from 'react-icons/fi';
import { AiOutlineMail } from 'react-icons/ai';
import { ReactNode, useState } from 'react';
import { GetServerSideProps } from 'next';
import { IoCheckmarkCircle } from 'react-icons/io5';

import { TextInput } from '@/components/Inputs/Text';
import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';
import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { EMPTY_SUPPORT_DATA, ISupportData, supportSchema } from '@/_base/interfaces/help';
import { AppReCaptcha } from '@/components/ReCaptcha';
import { GenericButton } from '@/components/Buttons/Generic';
import { IReCAPTCHAData } from '@/_base/interfaces/auth/IReCaptchaData';

type PageStepsType = 'RECOVER_BY_EMAIL' | 'RECOVER_BY_USERNAME' | 'TEACHER_SENT' | 'RECOVER_CODE' | 'NEW_PASSWORD' | 'PASSWORD_CHANGED';

const SizeMapper: Record<PageStepsType, string> = {
  RECOVER_BY_EMAIL: '28.5rem',
  RECOVER_BY_USERNAME: '34.25rem',
  TEACHER_SENT: '47rem',
  RECOVER_CODE: '40rem',
  PASSWORD_CHANGED: '28.5rem',
  NEW_PASSWORD: '28.5rem',
};

const Recover: React.FC = () => {
  const [step, setStep] = useState<PageStepsType>('RECOVER_BY_EMAIL');
  const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });


  const PageStepElement: Record<PageStepsType, ReactNode> = {
    RECOVER_BY_EMAIL: (
      <Flex direction="column" justify="space-between" h="100%">
        <Link href="/help" w="100%">
          <Flex padding="12px 0 0 0" w="100%" color="gray300" align="left" gap="8px">
            <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
            <Text textAlign="left">Voltar</Text>
          </Flex>{' '}
        </Link>
        {/*Botão de voltar */}
        <Flex direction="column" gap="8px">
          <Text fontWeight="600" fontSize="20px" color="gray900">
            Recupere a sua senha
          </Text>
          <Text color="text.gray">Um código de verificação será enviado para o seu e-mail e você poderá recuperar a sua senha</Text>
        </Flex>
        <Flex //Inputs
          direction="column"
          width="100%"
          gap="6px"
        >
          <TextInput
            leftElement={<AiOutlineMail style={{ margin: '10px 8px 10px 14px' }} />}
            // value={data.email}
            // error={errors.email}
            // onInputChange={(value) => setEmail(value)}
            label="E-mail"
            color="gray700"
            padding="10px 14px 10px 8px"
            placeholder="Informe seu e-mail"
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
          <Flex width="100%" textAlign="right" display="column" onClick={() => setStep('RECOVER_BY_USERNAME')}>
            <Text
              textAlign="right"
              color="error300"
              fontSize="12.5px"
              cursor="pointer"
              textDecoration="underline"
              _hover={{ filter: 'brightness(0.8)' }}
            >
              Não tenho um e-mail
            </Text>
          </Flex>

        <Flex
          color="white"
          align="center"
          justify="center"
          borderRadius="8px"
          padding="10px 18px"
          bg="primary900"
          onClick={() => setStep('RECOVER_CODE')}
        >
          <Text fontWeight="600">Enviar código</Text>
        </Flex>
      </Flex>
    ),
    RECOVER_CODE: (
      <Flex direction="column" h="100%" justify="space-between" align="center" gap="2rem">
        <Link href="/help" width="100%">
          <Flex padding="12px 0 0 0" width="100%" color="gray300" pt="1.5rem" gap="8px">
            <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
            <Text textAlign="left">Voltar</Text>
          </Flex>
        </Link>
        <Flex direction="column" width="100%" color="text.lightGray" align="center" gap="16px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Informe o código de acesso
            </Text>
            <Text color="gray500">Esse código estará nos seus livros. Informe ao campo abaixo e você será vinculado a sua turma.</Text>
          </Flex>
          <Flex gap="10px">
            <Flex
              h="80px"
              w="80px"
              borderRadius="8px"
              align="center"
              justify="center"
              color="gray300"
              border="1px"
              borderColor="gray300"
              fontSize="48px"
              fontWeight="500"
            >
              0
            </Flex>
            <Flex
              h="80px"
              w="80px"
              borderRadius="8px"
              align="center"
              justify="center"
              color="gray300"
              border="1px"
              borderColor="gray300"
              fontSize="48px"
              fontWeight="500"
            >
              0
            </Flex>
            <Flex
              h="80px"
              w="80px"
              borderRadius="8px"
              align="center"
              justify="center"
              color="gray300"
              border="1px"
              borderColor="gray300"
              fontSize="48px"
              fontWeight="500"
            >
              0
            </Flex>
            <Flex
              h="80px"
              w="80px"
              borderRadius="8px"
              align="center"
              justify="center"
              color="gray300"
              border="1px"
              borderColor="gray300"
              fontSize="48px"
              fontWeight="500"
            >
              0
            </Flex>
          </Flex>
        </Flex>
        <AppReCaptcha onChange={(token) => setCaptcha({ token })} error={captcha?.error} />

        <GenericButton label="Avançar" onClick={() => setStep('NEW_PASSWORD')} marginTop="8px" w="100%" />
      </Flex>
    ),
    NEW_PASSWORD: (
      <Flex direction="column" justify="space-between" h="100%">
        <Flex width="100%" marginTop="32px" gap="20px">
          <IoCheckmarkCircle fontSize="40px" style={{ color: '#E0EEFF' }} />
        </Flex>
        <Flex padding="20px 0" width="100%" color="gray900" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Enviado com sucesso!
            </Text>
            <Text color="gray500">Enviamos para o seu professor a solicitação de redefinição de senha</Text>
          </Flex>
        </Flex>
        <Flex
          color="white"
          align="center"
          justify="center"
          borderRadius="8px"
          padding="10px 18px"
          bg="primary900"
          onClick={() => setStep('PASSWORD_CHANGED')}
        >
          <Text fontWeight="600">Voltar</Text>
        </Flex>
      </Flex>
    ),
    PASSWORD_CHANGED: (
      <Flex direction="column" justify="space-between" h="100%">
        <Flex width="100%" marginTop="32px" gap="20px">
          <IoCheckmarkCircle fontSize="40px" style={{ color: '#E0EEFF' }} />
        </Flex>
        <Flex padding="20px 0" width="100%" color="gray900" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Enviado com sucesso!
            </Text>
            <Text color="gray500">Enviamos para o seu professor a solicitação de redefinição de senha</Text>
          </Flex>
        </Flex>
        <Link href="/login">
          <Flex color="white" align="center" justify="center" borderRadius="8px" padding="10px 18px" bg="primary900">
            <Text fontWeight="600">Voltar</Text>
          </Flex>
        </Link>
      </Flex>
    ),
    RECOVER_BY_USERNAME: (
      <Flex direction="column" justify="space-between" h="100%">
        <Link href="/help" w="100%">
          <Flex padding="12px 0 0 0" w="100%" color="gray300" align="left" gap="8px">
            <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
            <Text textAlign="left">Voltar</Text>
          </Flex>{' '}
        </Link>
        {/*Botão de voltar */}
        <Flex direction="column" gap="8px">
          <Text fontWeight="600" fontSize="20px" color="gray900">
            Recupere a sua senha
          </Text>
          <Text color="gray500">Informe o nome de usuário e iremos enviar uma solicitação de redefinição de senha para o seu professor</Text>
        </Flex>
        <Flex //Inputs
          direction="column"
          width="100%"
          gap="6px"
        >
          <TextInput
            leftElement={<FiUser style={{ margin: '10px 8px 10px 14px' }} />}
            // value={data.username}
            // error={errors.username}
            // onInputChange={(value) => onInputChange('username', value)}
            label="Nome de usuário"
            color="gray700"
            padding="10px 14px 10px 8px"
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

        <Flex width="100%" textAlign="right" display="column">
          <Text
            marginTop="-12px"
            marginBottom="8px"
            textAlign="right"
            color="red.200"
            fontSize="12.5px"
            cursor="pointer"
            textDecoration="underline"
            _hover={{ filter: 'brightness(0.8)' }}
          >
            Vou informar um e-mail
          </Text>
        </Flex>

        <Flex
          cursor="pointer"
          width="100%"
          color="white"
          align="center"
          justify="center"
          borderRadius="8px"
          padding="10px 18px"
          bg="primary900"
          onClick={() => setStep('TEACHER_SENT')}
        >
          <Text fontWeight="600">Enviar</Text>
        </Flex>
      </Flex>
    ),
    TEACHER_SENT: (
      <Flex direction="column" justify="space-between" h="100%">
        <Flex width="100%" marginTop="32px" gap="20px">
          <IoCheckmarkCircle fontSize="40px" style={{ color: '#E0EEFF' }} />
        </Flex>
        <Flex padding="20px 0" width="100%" color="gray900" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Enviado com sucesso!
            </Text>
            <Text color="gray500">Enviamos para o seu professor a solicitação de redefinição de senha</Text>
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
    <Flex
      direction="column"
      backgroundColor="white"
      height="fit-content"
      maxW="420px"
      margin="auto"
      borderRadius="12px"
      boxShadow="md"
      align="center"
      padding="24px"
      transition="all 0.2s"
      h={SizeMapper[step]}
      // h="fit-content"
    >
      <Logo />

      {PageStepElement[step]}
    </Flex>
  );
};

export default Recover;
