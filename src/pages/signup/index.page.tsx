import { ReactNode, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Flex, Link, Text } from '@chakra-ui/react';
import { FiChevronLeft, FiUser } from 'react-icons/fi';
import { MdMailOutline } from 'react-icons/md';

import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { IReCAPTCHAData } from '@/_base/interfaces/auth/IReCaptchaData';
import { HubUserType } from '@/_base/interfaces/user/HubUserType';
import IRegisterUser, { EMPTY_REGISTER_USER_DATA } from '@/_base/interfaces/user/IRegisterUser';
import { validateSession } from '@/_base/services/auth';
import { logError, tokenManager } from '@/_base/utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { PasswordInput } from '@/components/Inputs/Password';
import { TextInput } from '@/components/Inputs/Text';
import { Logo } from '@/components/Logo';
import { AppReCaptcha } from '@/components/ReCaptcha';
import { CodeInput } from '@/components/Inputs/Code';

type PageStepsType = 'USER_TYPE' | 'PRIMARY_CODE' | 'FORM' | 'FINISH';

const SizeMapper: Record<PageStepsType, string> = {
  USER_TYPE: '28.5rem',
  PRIMARY_CODE: '35.25rem',
  FORM: '47rem',
  FINISH: '28.5rem',
};

const SignUp: React.FC = () => {
  const [step, setStep] = useState<PageStepsType>('USER_TYPE');
  const [userType, setUserType] = useState<HubUserType>();
  const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });
  const [primaryCode, setPrimaryCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const { errors, onInputChange, data } = useInputHandler<IRegisterUser>({ data: EMPTY_REGISTER_USER_DATA });

  const handleCheckCode = useAsyncCallback(
    async (code: string) => {
      try {
        setSubmitLoading(true);
        // TODO: send request to backend
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(userType);
          }, 2000);
        });

        setPrimaryCode(code);

        if (captcha.token) {
          setStep('FORM');

          return;
        }
      } catch {
        setCodeError('Código inválido');
      }
    },
    [],
    false,
    () => setSubmitLoading(false),
  );

  const handleUserTypeChange = (type: HubUserType) => {
    setUserType(type);
    setCaptcha({ token: null });
    setPrimaryCode('');
    setCodeError('');
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
        <Flex padding="12px 0 0 0" width="100%" color="gray300" pt="1.5rem" gap="8px" cursor="pointer" onClick={() => setStep('USER_TYPE')}>
          <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
          <Text textAlign="left">Voltar</Text>
        </Flex>
        <Flex direction="column" width="100%" color="text.lightGray" align="center" gap="16px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Informe o código de acesso
            </Text>
            <Text color="gray500">Esse código estará nos seus livros. Informe ao campo abaixo e você será vinculado a sua turma.</Text>
          </Flex>
          <CodeInput onFill={handleCheckCode} error={codeError} onChange={() => setCodeError('')} />
        </Flex>
        <AppReCaptcha onChange={(token) => setCaptcha({ token })} error={captcha?.error} />

        <GenericButton
          label="Avançar"
          onClick={() => setStep('FORM')}
          isLoading={submitLoading}
          marginTop="8px"
          w="100%"
          isDisabled={!primaryCode || !captcha.token}
        />
      </Flex>
    ),
    FORM: (
      <Flex direction="column" h="100%" justify="space-between" align="center" gap="2rem" overflow="hidden">
        <Flex padding="12px 0 0 0" width="100%" color="text.lightGray" align="left" gap="8px" cursor="pointer" onClick={() => setStep('USER_TYPE')}>
          <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
          <Text textAlign="left">Voltar</Text>
        </Flex>
        <Flex //Inputs
          direction="column"
          width="100%"
          gap="12px"
        >
          <TextInput
            label="Nome Completo"
            value={data.name}
            error={errors.name}
            onInputChange={(value) => {
              onInputChange('name', value);
              onInputChange('username', value.split(' ').slice(0, 2).join(' ').toLocaleLowerCase().replaceAll(' ', '-'));
            }}
          />
          <TextInput
            label="Nome de Usuário"
            value={data.username}
            placeholder=""
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
            placeholder="01/01/2000"
            onInputChange={(value) =>
              onInputChange(
                'birthdate',
                value
                  .slice(0, 10)
                  .replace(/\D/g, '')
                  .replace(/^(\d{2})(\d{2})(\d{4})$/, '$1/$2/$3'),
              )
            }
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
        <Flex padding="12px 0 0 0" width="100%" color="text.lightGray" align="left" gap="8px">
          <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
          <Text textAlign="left">Voltar</Text>
        </Flex>
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
