/* eslint-disable no-console */
import { Checkbox, Flex, Image, Link, Text } from '@chakra-ui/react';
import { useGoogleLogin } from '@react-oauth/google';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FiUser } from 'react-icons/fi';

import { useAsyncCallback, useCustomToast, useInputHandler } from '@/_base/hooks';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { googleLogin, hubLogin, validateSession } from '@/_base/services/auth';
import { logError, showErrorToClient, tokenManager } from '@/_base/utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { PasswordInput } from '@/components/Inputs/Password';
import { TextInput } from '@/components/Inputs/Text';
import { Logo } from '@/components/Logo';
import { AppReCaptcha } from '@/components/ReCaptcha';
import { IAuthRequest, authSchema } from '@/_base/interfaces/auth';
import { IReCAPTCHAData } from '@/_base/interfaces/auth/IReCaptchaData';

const LoginPage: React.FC = () => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });

  const { errors, onInputChange, data, submit } = useInputHandler<IAuthRequest>({ schema: authSchema });
  const router = useCustomRouter();
  const toast = useCustomToast();

  const handleLogin = useAsyncCallback(
    async (googleAccessToken?: string) => {
      // Prevent the user to click on the button more than one time
      setSubmitLoading(true);

      if (!captcha.token) {
        setCaptcha((e) => ({ ...e, error: 'Captcha obrigatório' }));
        return;
      } else setCaptcha((e) => ({ ...e, error: undefined }));

      const { access_token } = googleAccessToken
        ? await googleLogin(googleAccessToken)
        : await hubLogin({
            identifier: data.identifier,
            password: data.password,
          });

      tokenManager.setToken(access_token);

      router.push('/home');
    },
    [router, captcha],
    () => setSubmitLoading(false),
  );

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => await handleLogin(codeResponse.access_token),
    onError: (error) => {
      showErrorToClient(error, toast);
      console.error('Google Login Failed:', error);
    },
  });

  return (
    <Flex h="100%" width="100%" justifyContent="center" alignItems="center" boxShadow="md">
      <Flex direction="column" bg="white" padding="1rem" boxShadow="md" borderColor="gray300" borderRadius="md" gap="1.15rem" align="center">
        <Flex direction="column" gap="1rem" alignSelf="center" w="100%">
          <Logo size="sm" />

          <Text fontSize="13px" textAlign="center" color="gray400">
            Ainda não tem uma conta?{' '}
            <Link href="/signup" color="primary900" textDecoration="underline" _hover={{ color: 'blue600' }}>
              Cadastre-se
            </Link>
          </Text>

          <TextInput
            label="Nome de Usuário ou E-mail"
            error={errors.identifier}
            value={data?.identifier}
            onInputChange={(v) => onInputChange('identifier', v)}
            leftElement={<FiUser style={{ color: 'gray300' }} />}
            placeholder="Nome de Usuário"
          />

          <PasswordInput
            label="Senha"
            error={errors.password}
            value={data?.password}
            onInputChange={(v) => onInputChange('password', v)}
            placeholder="Sua senha"
          />

          <Link href="/help">
            <Text
              textAlign="right"
              color="error300"
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
          <Text fontWeight="medium" _hover={{ filter: 'brightness(1.5)' }} userSelect="none">
            Mantenha-me contectado
          </Text>
        </Flex>

        <Flex direction="column" w="100%" gap="0.5rem">
          <Flex position="relative" w="100%" align="center" justify="center">
            <Flex border="1px solid #F2F4F4" w="100%" position="absolute" zIndex="1" />
            <Text zIndex="2" px="1rem" textAlign="center" bg="white" fontSize="12.5px" color="gray300">
              Ou faça login com
            </Text>
          </Flex>

          <GenericButton
            label="Entrar com Google"
            btntype="outline"
            color="gray700"
            border="1px"
            fontSize="15px"
            fontWeight="medium"
            borderColor="text.lightGray"
            onClick={() => handleGoogleLogin()}
            isLoading={submitLoading}
            leftIcon={<Image src="/brands/google_logo_G.png" />}
          />
        </Flex>

        <AppReCaptcha onChange={(token) => setCaptcha({ token })} error={captcha?.error} />

        <GenericButton btntype="primary" label="Entrar" onClick={() => submit(handleLogin)} isLoading={submitLoading} marginTop="8px" w="100%" />
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
