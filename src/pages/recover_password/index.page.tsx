import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import zxcvbn from 'zxcvbn';

import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { checkRecoveryToken, sendRecoveryToken, updateForgottenPassword } from '@/_base/services/admin';
import { validateSession } from '@/_base/services/auth';
import { forceTokenExpiration, logError, updateApiToken } from '@/_base/utils';
import { AppButton } from '@/components/Forms/Button';
import { AppInput, AppPassword } from '@/components/Forms/Input';
import { Flex, Heading, Image, Progress, Text } from '@chakra-ui/react';
import adhowLogo from '/public/adhow-logo-white.png';
import loginImage from '/public/images/login/background-login.png';

type DataType = { value: string; validated?: boolean; error?: { type: string; message: string } };

const RecoverPassword: React.FC = () => {
  const [email, setEmail] = useState<DataType>({ value: '' });
  const [recoveryToken, setRecoveryToken] = useState<DataType>({ value: '' });
  const [newPassword, setNewPassword] = useState<DataType>({ value: '' });
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState<DataType>({ value: '' });

  const router = useCustomRouter();
  const toast = useCustomToast();

  const passStrong: number = useMemo(() => zxcvbn(newPassword.value).score, [newPassword.value]);

  const handleSendRecoveryToken = useAsyncCallback(async () => {
    const emailIsValid = z.string().email().nonempty().safeParse(email.value).success;

    if (!emailIsValid) {
      setEmail((e) => ({ ...e, error: { message: 'E-mail inválido', type: 'validation' } }));
      return;
    }

    await sendRecoveryToken(email.value);

    setEmail((e) => ({ ...e, validated: true, error: undefined }));
  }, [email]);

  const handleCheckRecoveryToken = useAsyncCallback(async () => {
    const { response } = await checkRecoveryToken(email.value, String(recoveryToken.value));
    setRecoveryToken((e) => ({ ...e, validated: response, error: undefined }));
    if (!response) toast({ status: 'error', title: 'Recovery code invalid or expired' });
  }, [recoveryToken]);

  const handleNewPassword = useAsyncCallback(async () => {
    setNewPassword((e) => ({ ...e, validated: true }));
  }, [newPassword]);

  const handleUpdateForgottenPassword = useAsyncCallback(async () => {
    if (newPassword.value !== newPasswordConfirmation.value) {
      setNewPasswordConfirmation((e) => ({ ...e, error: { message: 'As senhas não são iguais', type: 'validation' } }));
      return;
    }

    await updateForgottenPassword(email.value, String(recoveryToken.value), newPassword.value);
    setNewPassword((e) => ({ ...e, validated: true, error: undefined }));
    toast({ title: 'Senha atualizada!', status: 'success' });
    router.push('/login');
  }, [newPassword, newPasswordConfirmation]);

  return (
    <Flex height={'100vh'} overflow="hidden">
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
        zIndex="1"
      >
        <Image src={adhowLogo.src} maxW={'250px'} alt="logo" />
      </Flex>
      <Flex bg={'#fcfcfc'} width={'50%'} justifyContent="center" align="center" position="relative">
        <Heading fontSize="32px" color={'#2a075d'} marginBottom="17rem">
          Recuperação de senha
        </Heading>

        {/* STEP 1 */}

        <Flex
          w="100%"
          maxW="28rem"
          position="absolute"
          top="50%"
          left="50%"
          transform={email.validated ? 'translate(-150%, -50%)' : 'translate(-50%, -50%)'}
          transition="all 1s cubic-bezier(1, -0.4, 0.22, 1.3)"
          opacity={email.validated ? '0' : '1'}
          direction="column"
          px={8}
          gap={4}
        >
          <Text align="center">Insira seu e-mail cadastrado na plataforma</Text>

          <Flex flexDir="column" gap={4}>
            <AppInput
              label="Email"
              error={email.error}
              border={'none'}
              bg={'#f7f7f7'}
              borderLeft={'3px solid #81BE73'}
              borderRadius={'0'}
              value={email.value}
              onChange={(e) => setEmail({ value: e.target.value })}
            />

            <AppButton label="OK" bg={'#2a075d'} letterSpacing={'1.5px'} fontWeight={'100'} onClick={handleSendRecoveryToken} marginTop={'8px'} />
          </Flex>
        </Flex>

        {/* STEP 2 */}

        <Flex
          w="100%"
          maxW="28rem"
          position="absolute"
          top="50%"
          left="50%"
          transform={
            email.validated && !recoveryToken.validated
              ? 'translate(-50%, -50%)'
              : recoveryToken.validated
              ? 'translate(-150%, -50%)'
              : 'translate(150%, -50%)'
          }
          transition="all 1s cubic-bezier(1, -0.4, 0.22, 1.3)"
          opacity={email.validated && !recoveryToken.validated ? '1' : '0'}
          direction="column"
          px={8}
          gap={4}
          paddingTop="2rem"
        >
          <Text align="center">Enviamos um código para o seu e-mail para prosseguir com a redefinição de senha.</Text>

          <Text align="center">Verifique seu e-mail e insira o código abaixo</Text>

          <Flex flexDir="column" gap={4}>
            <AppInput
              label="Código"
              error={recoveryToken.error}
              border={'none'}
              bg={'#f7f7f7'}
              borderLeft={'3px solid #81BE73'}
              borderRadius={'0'}
              value={recoveryToken.value}
              onChange={(e) => setRecoveryToken({ value: e.target.value.replace(/[^\d]/, '') })}
            />

            <AppButton
              label="Verificar"
              bg={'#2a075d'}
              letterSpacing={'1.5px'}
              fontWeight={'100'}
              onClick={handleCheckRecoveryToken}
              marginTop={'8px'}
              isDisabled={recoveryToken.value.length !== 8}
            />
          </Flex>
        </Flex>

        {/* STEP 3 */}

        <Flex
          w="100%"
          maxW="28rem"
          position="absolute"
          top="50%"
          left="50%"
          transform={
            recoveryToken.validated && !newPassword.validated
              ? 'translate(-50%, -50%)'
              : newPassword.validated
              ? 'translate(-150%, -50%)'
              : 'translate(150%, -50%)'
          }
          opacity={recoveryToken.validated && !newPassword.validated ? '1' : '0'}
          transition="all 1s cubic-bezier(1, -0.4, 0.22, 1.3)"
          direction="column"
          px={8}
          gap={4}
          paddingTop="1rem"
        >
          <Text align="center">Insira sua nova senha</Text>

          <Flex flexDir="column" gap={4}>
            <AppPassword
              label="Nova senha"
              border={'none'}
              bg={'#f7f7f7'}
              borderLeft={'3px solid #81BE73'}
              borderRadius={'0'}
              value={newPassword.value}
              onChange={(e) => setNewPassword({ value: e.target.value })}
            />
            <Text margin="-0.5rem 0 -1rem" w="100%" color="text.gray">
              Password strong
            </Text>
            <Progress
              max={4}
              value={!newPassword.value ? 0 : passStrong || 1}
              size="md"
              colorScheme={passStrong < 3 ? 'red' : 'green'}
              rounded={10}
            />

            <AppButton
              label="Confirmar"
              bg={'#2a075d'}
              letterSpacing={'1.5px'}
              fontWeight={'100'}
              onClick={handleNewPassword}
              marginTop={'8px'}
              isDisabled={passStrong < 3}
            />
          </Flex>
        </Flex>

        {/* STEP 4 */}

        <Flex
          w="100%"
          maxW="28rem"
          position="absolute"
          top="50%"
          left="50%"
          transform={newPassword.validated ? 'translate(-50%, -50%)' : ' translate(150%, -50%)'}
          opacity={newPassword.validated ? '1' : '0'}
          transition="all 1s cubic-bezier(1, -0.4, 0.22, 1.3)"
          direction="column"
          px={8}
          gap={4}
        >
          <Text align="center">Confirme sua nova senha</Text>

          <Flex flexDir="column" gap={4}>
            <AppPassword
              label="Confirme a nova senha"
              error={newPasswordConfirmation.error}
              border={'none'}
              bg={'#f7f7f7'}
              borderLeft={'3px solid #81BE73'}
              borderRadius={'0'}
              value={newPasswordConfirmation.value}
              onChange={(e) => setNewPasswordConfirmation({ value: e.target.value })}
            />

            <AppButton
              label="Atualizar senha"
              bg={'#2a075d'}
              letterSpacing={'1.5px'}
              fontWeight={'100'}
              onClick={handleUpdateForgottenPassword}
              marginTop={'8px'}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default RecoverPassword;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'recover_password';

  try {
    updateApiToken(req);

    await validateSession();

    return { redirect: { destination: '/home', permanent: false } };
  } catch (err: any) {
    forceTokenExpiration(res);
    logError(selectedPage, err);

    return { props: { selectedPage, pageTitle: 'Recover password' } };
  }
};
