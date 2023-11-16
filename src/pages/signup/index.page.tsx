import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { IReCAPTCHAData } from '@/_base/interfaces/auth/IReCaptchaData';
import { ISupportData } from '@/_base/interfaces/help';
import { HubUserType } from '@/_base/interfaces/user/HubUserType';
import IRegisterUser from '@/_base/interfaces/user/IRegisterUser';
import { validateSession } from '@/_base/services/auth';
import { logError, tokenManager } from '@/_base/utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { PasswordInput } from '@/components/Inputs/Password';
import { TextInput } from '@/components/Inputs/Text';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { Logo } from '@/components/Logo';
import { AppReCaptcha } from '@/components/ReCaptcha';
import { Box, Flex, Link, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { ReactNode, SetStateAction, useMemo, useState } from 'react';
import { FiChevronLeft, FiUser } from 'react-icons/fi';
import { MdMailOutline } from 'react-icons/md';

type PageStepsType = 'USER_TYPE' | 'PRIMARY_CODE' | 'FORM' | 'FINISH';

const SizeMapper: Record<PageStepsType, string> = {
  USER_TYPE: '28.5rem',
  PRIMARY_CODE: '34.25rem',
  FORM: '47rem',
  FINISH: '28.5rem',
};

const SignUp: React.FC = () => {
  const [step, setStep] = useState<PageStepsType>('USER_TYPE');
  const [userType, setUserType] = useState<HubUserType>();
  const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });
  const [primaryCode, setPrimaryCode] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const { errors, onInputChange, data, submit } = useInputHandler<IRegisterUser>();

  const handleCheckCode = useAsyncCallback(async () => {
    // TODO: send request to backend
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
        setStep('FORM');
      }, 5000);
    });
  }, []);

  const handleUserTypeChange = (type: HubUserType) => {
    setUserType(type);
    setStep('PRIMARY_CODE');
  };

  const PageStepElement: Record<PageStepsType, ReactNode> = {
    USER_TYPE: (
      <Flex direction="column" h="100%" align="center" justify="space-between">
        <Flex color="gray400" whiteSpace="nowrap" gap="0.25rem" fontSize="14px" padding="32px 0">
          <Text>Já tem uma conta?</Text>
          <Link href="/login" width="100%" color="primary900" textDecoration="underline">
            Faça o Login
          </Link>
        </Flex>
        <Flex padding="20px 0" width="100%" color="text.lightGray" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="text.black">
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
            onClick={() => handleUserTypeChange('student')}
          >
            <Flex className="IMAGEM DO TIPO DE USUÁRIO SELECIONADO" flex="1" />
            <Flex
              h="28px"
              // bg={userType === 'student' ? 'primary900' : 'primary200'}
              // color={userType === 'student' ? 'gray25' : 'gray800'}
              bg="primary900"
              color="gray25"
              align="center"
              justify="center"
            >
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
            onClick={() => handleUserTypeChange('teacher')}
          >
            <Flex className="IMAGEM DO TIPO DE USUÁRIO SELECIONADO" flex="1" />
            <Flex
              h="28px"
              // bg={userType === 'teacher' ? 'primary900' : 'primary200'}
              // color={userType === 'teacher' ? 'gray25' : 'gray800'}
              bg="primary200"
              color="gray800"
              align="center"
              justify="center"
            >
              Professor
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    ),
    PRIMARY_CODE: (
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

        <GenericButton label="Avançar" onClick={() => setStep('FORM')} isLoading={submitLoading} marginTop="8px" w="100%" />
      </Flex>
    ),
    FORM: (
      <Flex direction="column" h="100%" justify="space-between" align="center" gap="2rem" overflow="hidden">
        <Link href="/login" width="100%">
          <Flex padding="12px 0 0 0" width="100%" color="text.lightGray" align="left" gap="8px">
            <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
            <Text textAlign="left">Voltar</Text>
          </Flex>
        </Link>
        <Flex //Inputs
          direction="column"
          width="100%"
          gap="12px"
        >
          <TextInput label="Nome Completo" value={data.name} error={errors.name} onInputChange={(value) => onInputChange('name', value)} />
          <TextInput
            label="Nome de Usuário"
            value={data.username}
            error={errors.username}
            onInputChange={(value) => onInputChange('username', value)}
            leftElement={<FiUser />}
          />
          <TextInput
            label="E-mail (opcional)"
            value={data.email}
            error={errors.email}
            onInputChange={(value) => onInputChange('email', value)}
            leftElement={<MdMailOutline />}
          />
          <TextInput
            label="Data de Nascimento"
            value={data.birthdate?.toString()}
            error={errors.birthdate}
            onInputChange={(value) => onInputChange('birthdate', value)}
          />
          <PasswordInput label="Senha" error={errors.password} value={data?.password} onInputChange={(value) => onInputChange('password', value)} />
          <PasswordInput
            label="Confirmar Senha"
            error={errors.password_confirmation}
            value={data?.password_confirmation}
            onInputChange={(v) => onInputChange('password_confirmation', v)}
          />
        </Flex>

        <GenericButton label="Cadastrar" onClick={() => setStep('FINISH')} isLoading={submitLoading} marginTop="8px" w="100%" />
      </Flex>
    ),
    FINISH: (
      <Flex direction="column" h="100%" justify="space-between" align="center" gap="2rem">
        <Link href="/help" width="100%">
          <Flex padding="12px 0 0 0" width="100%" color="text.lightGray" align="left" gap="8px">
            <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
            <Text textAlign="left">Voltar</Text>
          </Flex>
        </Link>
        <Flex padding="20px 0" width="100%" color="text.lightGray" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="text.black">
              Cadastro Realizado com sucesso
            </Text>
            <Text color="text.gray">Parabéns! Seu cadastro foi realizado com sucesso. Agora você pode fazer o login para acessar sua conta.</Text>
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

export default SignUp;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'signup';

  try {
    tokenManager.updateToken(req);

    await validateSession();

    return { redirect: { destination: '/home', permanent: false } };
  } catch (err: any) {
    tokenManager.forceExpires(res);
    logError(selectedPage, err);

    return { props: { selectedPage, pageTitle: 'Cadastro' } };
  }
};
