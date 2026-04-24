/* eslint-disable no-console */
import { Checkbox, Flex, Link, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FiUser } from 'react-icons/fi';

import { useAsyncCallback, useAuth, useCustomToast, useInputHandler, useLoading } from '@/_base/hooks';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { googleLogin, hubLogin, validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { PasswordInput } from '@/components/Inputs/Password';
import { TextInput } from '@/components/Inputs/Text';
import { Logo } from '@/components/Logo';
import { IAuthRequest, authSchema } from '@/_base/interfaces/auth';
import { api } from '@/_base/classes/api';

const LoginPage: React.FC = () => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [keepLogged, setKeepLogged] = useState(false);
  // const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });

  const { errors, onInputChange, data, submit } = useInputHandler<IAuthRequest>({ schema: authSchema });
  const { setLoadingConfig } = useLoading();
  const { setUser } = useAuth();
  const router = useCustomRouter();
  const toast = useCustomToast();

  const handleLogin = useAsyncCallback(
    async (googleAccessToken?: string) => {
      // Prevent the user to click on the button more than one time
      setSubmitLoading(true);

      // if (!captcha.token) {
      //   setCaptcha((e) => ({ ...e, error: 'Captcha obrigatório' }));
      //   return;
      // } else setCaptcha((e) => ({ ...e, error: undefined }));

      const { user, access_token } = googleAccessToken
        ? await googleLogin(googleAccessToken)
        : await hubLogin({
            identifier: data.identifier,
            password: data.password,
          });

      if (user.schools.find((e) => !e.approved_at)) {
        toast({ status: `error`, description: `Seu cadastro está pendente de avaliação` });
        return;
      }
      // If keep logged in is checked, the token will be expires in 15 days
      cookieManager.setToken(access_token, keepLogged ? 15 : 1);
      api.defaults.headers.authorization = `Bearer ${access_token}`;
      const loggedUser = await validateSession();
      setUser({ ...loggedUser, ...user });

      setLoadingConfig((cfg) => ({ ...cfg, isLoading: true, type: 'fullscreen-with-info' }));

      await new Promise((res) =>
        setTimeout(() => {
          router.push('/profile', `fullscreen-with-info`);
          setTimeout(() => res(true), 15000);
        }, 2000),
      );
    },
    [router],
    false,
    () => setSubmitLoading(false),
  );

  return (
    <Flex h="100%" width="100%" justifyContent="center" alignItems="center">
      <Flex w="400px" direction="column" bg="white" p="1rem" borderColor="gray300" borderRadius="10px" gap="1.15rem" align="center">
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
            color="gray900"
            onInputChange={(v) => onInputChange('identifier', v.trim().toLowerCase())}
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
          <Checkbox onChange={(e) => setKeepLogged(e.target.checked)} borderColor="gray300" />
          <Text fontWeight="medium" _hover={{ filter: 'brightness(1.5)' }} userSelect="none" color="gray700">
            Mantenha-me contectado
          </Text>
        </Flex>

        {/* <Flex direction="column" w="100%" gap="0.5rem">
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
            borderColor="gray300"
            onClick={() => handleGoogleLogin()}
            isLoading={submitLoading}
            leftIcon={<Image src="/brands/google_logo_G.png" />}
          />
        </Flex> */}

        {/* <AppReCaptcha onChange={(token) => setCaptcha({ token })} error={captcha?.error} /> */}

        <GenericButton btntype="primary" label="Entrar" onClick={() => submit(handleLogin)} isLoading={submitLoading} marginTop="8px" w="100%" />
      </Flex>
    </Flex>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'login';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { redirect: { destination: '/profile', permanent: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { props: { selectedPage, pageTitle: 'Login' } };
  }
};
