import { GetServerSideProps } from 'next';
import { useState } from 'react';

import { zodErrorHandler } from '@/_base/errors/zodErrorHandler';
import { useAsyncCallback } from '@/_base/hooks';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { usePageContext } from '@/_base/hooks/Page';
import { validateSession } from '@/_base/services/auth';
import { IAuthLoginInput, authSchema } from '@/_base/services/auth/interface';
import { forceTokenExpiration, logError, updateApiToken } from '@/_base/utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { PasswordInput } from '@/components/Inputs/Password';
import { TextInput } from '@/components/Inputs/Text';
import { AppReCaptcha } from '@/components/ReCaptcha';
import { Flex, Heading, Text } from '@chakra-ui/react';

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

  const { setAdmin } = usePageContext();

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

  return (
    <Flex h="100%" width="100%" bg="bg.gray" justifyContent="center" alignItems="center">
      <Flex direction="column" bg="bg.offWhite" padding="1rem" border="1px" borderColor="border.light" borderRadius="md" gap="1rem">
        <Flex direction="column" gap="1rem" maxW="19rem" alignSelf="center" w="100%">
          <Heading fontSize="32px" maxW="350px" color="primary" textAlign="center">
            Hub PiCode
          </Heading>

          <TextInput
            placeholder="Email"
            error={errors.identifier}
            value={credentials?.identifier}
            onInputChange={(v) => handleInputChange('identifier', v)}
          />

          <PasswordInput
            placeholder="Senha"
            error={errors.password}
            value={credentials?.password}
            onInputChange={(v) => handleInputChange('password', v)}
          />

          <Text
            mt="-0.8rem"
            mb="0.8rem"
            textAlign="right"
            color="primary"
            cursor="pointer"
            _hover={{ filter: 'brightness(2)' }}
            onClick={() => router.push('/recover_password')}
          >
            Esqueceu a senha?
          </Text>
        </Flex>

        <AppReCaptcha onChange={(token) => setCaptcha({ token })} error={captcha?.error} />

        <GenericButton
          label="Entrar"
          bg="primary"
          letterSpacing="1.5px"
          fontWeight="100"
          onClick={() => handleSubmit()}
          isLoading={submitLoading}
          marginTop="8px"
          maxW="19rem"
          w="100%"
          alignSelf="center"
        />
      </Flex>
    </Flex>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'login';

  try {
    updateApiToken(req);

    await validateSession();

    return { redirect: { destination: '/home', permanent: false } };
  } catch (err: any) {
    forceTokenExpiration(res);
    logError(selectedPage, err);

    return { props: { selectedPage, pageTitle: 'Login' } };
  }
};
