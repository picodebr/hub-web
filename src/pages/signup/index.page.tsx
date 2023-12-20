import { ReactNode, useEffect, useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import { FiChevronLeft, FiUser } from 'react-icons/fi';
import { MdMailOutline } from 'react-icons/md';
import { GiCheckMark } from 'react-icons/gi';
import { DatePicker } from '@orange_digital/chakra-datepicker';

import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { IReCAPTCHAData } from '@/_base/interfaces/auth/IReCaptchaData';
import { HubUserType } from '@/_base/interfaces/user/HubUserType';
import IRegisterUser, { EMPTY_REGISTER_USER_DATA, registerUserSchema } from '@/_base/interfaces/user/IRegisterUser';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { PasswordInput } from '@/components/Inputs/Password';
import { TextInput } from '@/components/Inputs/Text';
import { Logo } from '@/components/Logo';
import { AppReCaptcha } from '@/components/ReCaptcha';
import { CodeInput } from '@/components/Inputs/Code';
import { Flex, Link, Text } from '@chakra-ui/react';
import { IGoogleUserData } from '@/_base/interfaces/auth/IGoogleUserData';
import { checkEmail, checkPrimaryCode, checkUsername, signup } from '@/_base/services/user';
import { DateInput } from '@/components/Inputs/Date';

type PageStepsType = 'USER_TYPE' | 'PRIMARY_CODE' | 'FORM' | 'FINISH';

const SizeMapper: Record<PageStepsType, string> = {
  USER_TYPE: '28.5rem',
  PRIMARY_CODE: '35.25rem',
  FORM: 'fit-content',
  FINISH: '22rem',
};

export const formatDateInput = (value?: string | number | Date) =>
  value ? new Date(new Date(value || 0).getTime() + 600000)?.toISOString().split('T')[0] : '';

const SignUp: React.FC = () => {
  const [step, setStep] = useState<PageStepsType>('USER_TYPE');
  const [userType, setUserType] = useState<HubUserType>();
  const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });
  const [primaryCode, setPrimaryCode] = useState<{ value?: string; valid?: boolean; error?: string }>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isGoogleSignin, setIsGoogleSignin] = useState(false);
  const [passwordIsValid, setPasswordIsValid] = useState(false);

  const { errors, onInputChange, data, setData, setErrors, submit } = useInputHandler<IRegisterUser>({
    data: EMPTY_REGISTER_USER_DATA,
    schema: registerUserSchema,
  });

  useEffect(() => {
    const data = cookieManager.getCookie<IGoogleUserData>('google_data', true);

    if (data) {
      setIsGoogleSignin(true);
      setData((e) => ({ ...e, email: data.email, name: data.name }));
      //TODO: save the picture from google
    }
  }, []);

  useEffect(() => {
    if (captcha.token && primaryCode.value) (async () => await handleCheckCode(primaryCode.value || ''))();
  }, [captcha.token, primaryCode.value]);

  const canSubmit = useMemo(
    () => passwordIsValid && !Object.values(Object.assign(EMPTY_REGISTER_USER_DATA, { ...data, email: '_' })).filter((e) => !e).length,
    [passwordIsValid, data],
  );

  const handleCheckCode = useAsyncCallback(
    async (code: string) => {
      if (!userType) return;

      try {
        // TODO: send request to backend
        const { is_valid } = await checkPrimaryCode(userType, code);

        if (!is_valid) {
          setPrimaryCode({ error: 'Código inválido' });
          return;
        }

        setData((e) => ({ ...e, primary_code: code }));
        setPrimaryCode((e) => ({ ...e, valid: true }));
      } catch {
        setPrimaryCode({ error: 'Código inválido' });
      }
    },
    [userType],
    false,
  );

  const handleRegisterUser = useAsyncCallback(
    async () => {
      if (data.password !== data.password_confirmation) {
        setErrors((e) => ({ ...e, password: 'As senhas não correspondem', password_confirmation: 'As senhas não correspondem' }));
        return;
      }

      setSubmitLoading(true);
      const [emailResponse, usernameResponse] = await Promise.all([checkEmail(data.email || ''), checkUsername(data.username)]);

      if (!emailResponse.is_valid) {
        setErrors((e) => ({ ...e, email: 'E-mail já cadastrado' }));
        return;
      }

      if (!usernameResponse.is_valid) {
        setErrors((e) => ({ ...e, username: 'Nome de usuário já cadastrado' }));
        return;
      }

      const signupData = { ...data };

      delete (signupData as any).password_confirmation;

      await signup(signupData);

      setStep('FINISH');
    },
    [data],
    false,
    () => setSubmitLoading(false),
  );

  const handleUserTypeChange = (type: HubUserType) => {
    setUserType(type);
    setCaptcha({ token: null });
    setPrimaryCode({});
    setData((e) => ({ ...e, user_type: type }));
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
            onClick={() => handleUserTypeChange('student')}
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
            onClick={() => handleUserTypeChange('teacher')}
          >
            <Flex className="IMAGEM DO TIPO DE USUÁRIO SELECIONADO" flex="1" />
            <Flex h="28px" bg="primary400" color="gray800" align="center" justify="center">
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
        <Flex direction="column" width="100%" align="center" gap="16px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Informe o código de acesso
            </Text>
            <Text color="gray500">Esse código estará nos seus livros. Informe ao campo abaixo e você será vinculado a sua turma.</Text>
          </Flex>
          <CodeInput
            onFill={(value) => setPrimaryCode((e) => ({ ...e, value }))}
            error={primaryCode.error}
            onChange={() => setPrimaryCode((e) => ({ ...e, error: '' }))}
          />
        </Flex>
        <AppReCaptcha onChange={(token) => setCaptcha({ token })} error={captcha?.error} />

        <GenericButton label="Avançar" onClick={() => setStep('FORM')} marginTop="8px" w="100%" isDisabled={!primaryCode.valid} />
      </Flex>
    ),
    FORM: (
      <Flex direction="column" h="100%" justify="space-between" align="center" gap="1.25rem" overflow="hidden">
        <Flex direction="column" gap="8px" marginTop="2rem">
          <Text fontWeight="600" fontSize="20px" color="gray900">
            Informe os seus dados
          </Text>
          <Text color="gray500">Faça o cadastro e desfrute de uma experiência completa</Text>
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
            isDisabled={isGoogleSignin}
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
            isDisabled={isGoogleSignin}
            error={errors.email}
            onInputChange={(value) => onInputChange('email', value)}
            leftElement={<MdMailOutline />}
          />

          <DateInput
            label="Data de Nascimento"
            value={formatDateInput(data.birthdate)}
            error={errors.birthdate}
            onInputChange={(value) => onInputChange('birthdate', value ? new Date(value) : '')}
          />

          <PasswordInput
            label="Senha"
            error={errors.password}
            value={data?.password}
            onInputChange={(value) => onInputChange('password', value)}
            passStrong={2}
            onPassStrongReached={() => setPasswordIsValid(true)}
            onPassStrongUnreached={() => setPasswordIsValid(false)}
          />

          <PasswordInput
            label="Confirmar Senha"
            error={errors.password_confirmation}
            value={data?.password_confirmation}
            onInputChange={(v) => onInputChange('password_confirmation', v)}
          />
        </Flex>

        <GenericButton
          label="Cadastrar"
          onClick={() => submit(handleRegisterUser)}
          isLoading={submitLoading}
          marginTop="8px"
          w="100%"
          isDisabled={!canSubmit}
        />
      </Flex>
    ),
    FINISH: (
      <Flex direction="column" justify="space-between" h="100%">
        <Flex width="100%" marginTop="32px" gap="20px">
          <GiCheckMark fontSize="40px" style={{ backgroundColor: '#E0EEFF', color: '#6699FF', borderRadius: '50%', padding: '8px' }} />
        </Flex>
        <Flex padding="20px 0" width="100%" color="gray900" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Cadastro realizado com sucesso
            </Text>
            <Text color="gray500">Parabéns! Seu cadastro foi realizado com sucesso. Agora você pode fazer o login para acessar sua conta.</Text>
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
      bgColor="white"
      height="fit-content"
      maxW="420px"
      margin="auto"
      borderRadius="12px"
      boxShadow="md"
      align="center"
      padding="24px"
      transition="all 0.2s"
      h={SizeMapper[step]}
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
    cookieManager.updateToken(req);

    await validateSession();

    return { redirect: { destination: '/courses', permanent: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { props: { selectedPage, pageTitle: 'Cadastro' } };
  }
};

export const CustomDatePicker: React.FC = () => {
  return <DatePicker initialValue={new Date()} />;
};
