import { Checkbox, Flex, Image, Link, Text } from '@chakra-ui/react';
import { TokenResponse, useGoogleLogin } from '@react-oauth/google';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FiUser } from 'react-icons/fi';

import { zodErrorHandler } from '@/_base/errors/zodErrorHandler';
import { useAsyncCallback } from '@/_base/hooks';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { validateSession } from '@/_base/services/auth';
import { IAuthLoginInput, authSchema } from '@/_base/services/auth/interface';
import { logError, tokenManager } from '@/_base/utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { PasswordInput } from '@/components/Inputs/Password';
import { TextInput } from '@/components/Inputs/Text';
import { Logo } from '@/components/Logo';
import { AppReCaptcha } from '@/components/ReCaptcha';

interface IReCAPTCHAData {
  token: string | null;
  error?: string;
}

const LoginPage: React.FC = () => {
  const router = useCustomRouter();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });
  const [credentials, setCredentials] = useState<IAuthLoginInput>({} as any);
  const [errors, setErrors] = useState<Record<keyof IAuthLoginInput, string | undefined>>({} as any);

  const [user, setUser] = useState<TokenResponse | null>(null)
    console.log(user);

  const handleSubmit = useAsyncCallback(async () => {
    if (!credentials) return;
    // Prevent the user to click on the button more than one time
    setSubmitLoading(true);

    try {
      const invalidData = zodErrorHandler(authSchema, credentials);

      if (invalidData) {
        setErrors(invalidData);
        return;
      }

      if (!captcha.token) {
        setCaptcha((e) => ({ ...e, error: 'Captcha obrigatório' }));
        return;
      } else setCaptcha((e) => ({ ...e, error: undefined }));

      // const { response } = await signin({
      //   identifier: credentials.identifier,
      //   password: credentials.password,
      // });

      // tokenManager.setToken(response.token);

      // setAdmin(response.user);

      router.push('/home');
    } finally {
      setSubmitLoading(false);
    }
  }, [router, captcha]);

  const handleInputChange = (field: keyof IAuthLoginInput, value: any) => {
    setErrors((e) => ({ ...e, [field]: undefined }));
    setCredentials((e) => ({ ...e, [field]: value }));
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('onSuccess :', codeResponse);
      setUser(codeResponse);
    },
    onError: (error) => console.log('Login Failed:', error),
  });

  return (
    <Flex h="100%" width="100%" justifyContent="center" alignItems="center">
      <Flex direction="column" bg="bg.offWhite" padding="1rem" border="1px" borderColor="border.light" borderRadius="md" gap="1.15rem" align="center">
        <Flex direction="column" gap="1rem" alignSelf="center" w="100%">
          <Logo />

          <Text fontSize="13px" textAlign="center">
            Ainda não tem uma conta?{' '}
            <Link href="/signup" color="blue.400" textDecoration="underline" _hover={{ color: 'blue.600' }}>
              Cadastre-se
            </Link>
          </Text>

          <TextInput
            label="Nome de Usuário ou E-mail"
            error={errors.identifier}
            value={credentials?.identifier}
            onInputChange={(v) => handleInputChange('identifier', v)}
            leftElement={<FiUser />}
          />

          <PasswordInput
            label="Senha"
            error={errors.password}
            value={credentials?.password}
            onInputChange={(v) => handleInputChange('password', v)}
          />

          <Link href="/help">
            <Text
              textAlign="right"
              color="red.200"
              fontSize="12.5px"
              cursor="pointer"
              textDecoration="underline"
              _hover={{ filter: 'brightness(0.8)' }}
            >
              Não estou conseguindo acessar
            </Text>
          </Link>
        </Flex>

        <Flex fontSize="13px" gap="0.5rem" align="center" w="100%">
          <Checkbox />
          <Text fontWeight="medium">Mantenha-me contectado</Text>
        </Flex>

        <Flex direction="column" w="100%" gap="0.5rem">
          <Flex position="relative" w="100%" align="center" justify="center">
            <Flex border="1px solid #F2F4F4" w="100%" position="absolute" zIndex="1" />
            <Text zIndex="2" px="1rem" textAlign="center" bg="bg.offWhite" fontSize="12.5px" color="text.lightGray">
              Ou faça login com
            </Text>
          </Flex>

          <GenericButton
            label="Entrar com Google"
            btntype="outline"
            color="text.black"
            border="2px"
            fontSize="15px"
            fontWeight="medium"
            borderColor="text.lightGray"
            onClick={() => login()}
            isLoading={submitLoading}
            leftIcon={<Image src="/brands/google_logo_G.png" />}
          />
        </Flex>

        <AppReCaptcha onChange={(token) => setCaptcha({ token })} error={captcha?.error} />

        <GenericButton label="Entrar" onClick={() => handleSubmit()} isLoading={submitLoading} marginTop="8px" w="100%" />
      </Flex>
    </Flex>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'login';

  try {
    tokenManager.updateToken(req);

    await validateSession();

    return { redirect: { destination: '/home', permanent: false } };
  } catch (err: any) {
    tokenManager.forceExpires(res);
    logError(selectedPage, err);

    return { props: { selectedPage, pageTitle: 'Login' } };
  }
};
