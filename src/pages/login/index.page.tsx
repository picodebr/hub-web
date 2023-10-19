import { GetServerSideProps } from 'next';
import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useForm } from 'react-hook-form';
import { PiWarningCircleBold } from 'react-icons/pi';

import { useAsyncCallback } from '@/_base/hooks';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { usePageContext } from '@/_base/hooks/Page';
import { login, validateSession } from '@/_base/services/auth';
import { IAuthLoginInput, authSchema } from '@/_base/services/auth/interface';
import { forceTokenExpiration, logError, tokenManager, updateApiToken } from '@/_base/utils';
import { AppButton } from '@/components/Forms/Button';
import { AppInput, AppPassword } from '@/components/Forms/Input';
import { Flex, Heading, Image, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import adhowLogo from '/public/adhow-logo-white.png';
import loginImage from '/public/images/login/background-login.png';

interface IReCAPTCHAData {
  token: string | null;
  error?: string;
}

const LoginPage: React.FC = () => {
  const router = useCustomRouter();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });

  const { setAdmin } = usePageContext();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<IAuthLoginInput>({ resolver: zodResolver(authSchema) });

  const handleFormInfo = useAsyncCallback(
    async (data: IAuthLoginInput) => {
      try {
        //Prevent the user to click on the button more than one time
        setSubmitLoading(true);

        if (!captcha.token) {
          setCaptcha((e) => ({ ...e, error: 'Required field' }));
          return;
        } else setCaptcha((e) => ({ ...e, error: undefined }));

        const { response } = await login({
          email: data.email,
          password: data.password,
        });

        tokenManager.setToken(response.token);

        setAdmin(response.user);

        router.push('/home');
      } finally {
        setSubmitLoading(false);
      }
    },
    [router, captcha],
  );

  return (
    <Flex height={'100vh'}>
      <Flex
        justifyContent="center"
        alignItems="center"
        width={'50%'}
        style={{
          backgroundImage: 'url(' + loginImage.src + ')',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Image src={adhowLogo.src} maxW={'250px'} alt="logo" />
      </Flex>
      <Flex bg={'#fcfcfc'} width={'50%'} justifyContent="center" alignItems="center">
        <Flex flexDir="column" role="presentation" px={8} py={8} gap={4}>
          <Flex flexDir="column" textAlign="center" alignItems={'center'} gap={4}>
            <Heading fontSize="32px" maxW={'350px'} color={'#2a075d'}>
              Plataforma de gestão de campanhas
            </Heading>
            <Text>Faça login com o usuário de administração</Text>
          </Flex>

          <Flex borderTop="1px solid" borderColor="gray.100" />

          <Flex direction="column" gap={4} maxW="19rem" alignSelf="center" w="100%">
            <AppInput
              label="Email"
              error={errors.email}
              border={'none'}
              bg={'#f7f7f7'}
              borderLeft={'3px solid #81BE73'}
              borderRadius={'0'}
              {...register('email', { required: true })}
            />
            <AppPassword
              label="Senha"
              error={errors.password}
              border={'none'}
              bg={'#f7f7f7'}
              borderLeft={'3px solid #81BE73'}
              borderRadius={'0'}
              {...register('password', { required: true })}
            />
            <Text
              margin="-0.5rem 0 0"
              color="primary"
              cursor="pointer"
              _hover={{ filter: 'brightness(2)' }}
              onClick={() => router.push('/recover_password')}
            >
              Forgot password?
            </Text>
          </Flex>
          <Flex align="center" direction="column" mt={2}>
            <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY || ''} onChange={(e) => setCaptcha({ token: e })} onError={console.error} />
            <Flex
              color="red.500"
              gap="0.3rem"
              align="center"
              w="100%"
              padding="0.25rem 1rem"
              fontSize="1.05rem"
              display={captcha.error ? 'flex' : 'none'}
            >
              <PiWarningCircleBold fontSize="1.15rem" />
              <Text letterSpacing={0.35}>{captcha.error}</Text>
            </Flex>
          </Flex>
          <AppButton
            label="Entrar"
            bg={'#2a075d'}
            letterSpacing={'1.5px'}
            fontWeight={'100'}
            onClick={handleSubmit(handleFormInfo)}
            isLoading={submitLoading}
            marginTop={'8px'}
            maxW="19rem"
            w="100%"
            alignSelf="center"
          />
        </Flex>
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
