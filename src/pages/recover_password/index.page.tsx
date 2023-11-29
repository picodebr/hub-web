import { FiChevronLeft, FiUser } from 'react-icons/fi';
import { AiOutlineMail } from 'react-icons/ai';
import { ReactNode, useMemo, useState } from 'react';
import { Flex, Link, Text } from '@chakra-ui/react';
import { GiCheckMark } from 'react-icons/gi';

import { TextInput } from '@/components/Inputs/Text';
import { Logo } from '@/components/Logo';
import { useAsyncCallback, useCustomToast, useInputHandler } from '@/_base/hooks';
import { IRecoverPassword, recoverPasswordSchema } from '@/_base/interfaces/help';
import { AppReCaptcha } from '@/components/ReCaptcha';
import { GenericButton } from '@/components/Buttons/Generic';
import { IReCAPTCHAData } from '@/_base/interfaces/auth/IReCaptchaData';
import { PasswordInput } from '@/components/Inputs/Password';
import { CodeInput } from '@/components/Inputs/Code';
import { checkRecoveryToken, recoverPassword, sendRecoveryToken } from '@/_base/services/user';
import { validateEmail } from '@/_base/utils';

type PageStepsType = 'RECOVER_BY_EMAIL' | 'RECOVER_BY_USERNAME' | 'TEACHER_SENT' | 'RECOVER_CODE' | 'NEW_PASSWORD' | 'PASSWORD_CHANGED';

const SizeMapper: Record<PageStepsType, string> = {
  RECOVER_BY_EMAIL: '27rem',
  RECOVER_BY_USERNAME: '28rem',
  TEACHER_SENT: '21rem',
  RECOVER_CODE: 'fit-content',
  PASSWORD_CHANGED: '21rem',
  NEW_PASSWORD: '28.5rem',
};

const RecoverPassword: React.FC = () => {
  const [step, setStep] = useState<PageStepsType>('RECOVER_BY_EMAIL');
  const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });
  const [passwordIsStronger, setPasswordIsStronger] = useState(false);

  const toast = useCustomToast();
  const { errors, onInputChange, data, setErrors, submit, checkErrors } = useInputHandler<IRecoverPassword>({ schema: recoverPasswordSchema });

  const canRedefine = useMemo<boolean>(() => passwordIsStronger && data.new_password === data.password_confirmation, [passwordIsStronger, data]);

  const handleSendRecoveryToken = useAsyncCallback(async () => {
    checkErrors();
    if (!validateEmail(data.identifier)) {
      setErrors((e) => ({ ...e, identifier: 'E-mail inválido' }));
      return;
    }

    if (errors.identifier) return;

    await sendRecoveryToken(data.identifier);

    setStep('RECOVER_CODE');
    setErrors({} as any);
  }, []);

  const handleCheckRecoveryToken = useAsyncCallback(async () => {
    checkErrors();

    if (errors.recovery_token) return;
    if (!captcha.token) setCaptcha((e) => ({ ...e, error: 'Campo obrigatório' }));

    const { is_valid, message } = await checkRecoveryToken({ identifier: data.identifier, token: data.recovery_token });

    if (is_valid) setStep('NEW_PASSWORD');
    else toast({ status: 'error', description: message || 'Código inválido' });
    setErrors({} as any);
  }, []);

  const handleRecoverPassword = useAsyncCallback(async () => {
    if (!data.identifier || !data.recovery_token) return;

    if (data.new_password !== data.password_confirmation) {
      setErrors((e) => ({ ...e, new_password: 'As senhas não correspondem', password_confirmation: 'As senhas não correspondem' }));
      return;
    }

    await recoverPassword({ identifier: data.identifier, token: data.recovery_token, password: data.new_password });

    setStep('PASSWORD_CHANGED');
  }, []);

  const PageStepElement: Record<PageStepsType, ReactNode> = {
    RECOVER_BY_EMAIL: (
      <Flex direction="column" justify="space-between" h="100%">
        <Link href="/help" w="100%">
          <Flex padding="12px 0 0 0" w="100%" color="gray300" align="left" gap="8px">
            <FiChevronLeft fontSize="20px" style={{ marginTop: '2px', color: 'primary900' }} />
            <Text textAlign="left">Voltar</Text>
          </Flex>{' '}
        </Link>
        {/*Botão de voltar */}
        <Flex direction="column" gap="8px">
          <Text fontWeight="600" fontSize="20px" color="gray900">
            Recupere a sua senha
          </Text>
          <Text color="gray500">Um código de verificação será enviado para o seu e-mail e você poderá recuperar a sua senha</Text>
        </Flex>
        <Flex //Inputs
          direction="column"
          width="100%"
          gap="6px"
        >
          <TextInput
            leftElement={<AiOutlineMail style={{ margin: '10px 8px 10px 14px' }} />}
            value={data.identifier}
            error={errors.identifier}
            onInputChange={(value) => onInputChange('identifier', value)}
            label="E-mail"
            color="gray700"
            padding="10px 14px 10px 8px"
            placeholder="Informe seu e-mail"
          />
        </Flex>
        <Flex width="100%" textAlign="right" display="column" onClick={() => setStep('RECOVER_BY_USERNAME')}>
          <Text
            marginTop="2px"
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
          onClick={handleSendRecoveryToken}
          cursor="pointer"
        >
          <Text fontWeight="600">Enviar código</Text>
        </Flex>
      </Flex>
    ),
    RECOVER_CODE: (
      <Flex direction="column" h="100%" justify="space-between" align="center" gap="2rem">
        <Flex padding="12px 0 0 0" width="100%" color="gray300" pt="1.5rem" gap="8px" onClick={() => setStep('RECOVER_BY_EMAIL')} cursor="pointer">
          <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
          <Text textAlign="left">Voltar</Text>
        </Flex>
        <Flex direction="column" width="100%" color="gray500" align="center" gap="16px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Informe o código de verificação
            </Text>
            <Text color="gray500">Foi enviado um código para o e-mail, verifique e informe o código nos campos abaixo</Text>
          </Flex>
          <CodeInput
            onFill={(value) => onInputChange('recovery_token', value)}
            error={errors.recovery_token}
            onChange={(value) => onInputChange('recovery_token', value)}
          />
        </Flex>
        <AppReCaptcha onChange={(token) => setCaptcha({ token })} error={captcha?.error} />

        <GenericButton label="Confirmar" onClick={handleCheckRecoveryToken} marginTop="8px" w="100%" />
      </Flex>
    ),
    NEW_PASSWORD: (
      <Flex direction="column" justify="space-between" h="100%">
        <Flex padding="32px 0 5px 0" width="100%" color="gray900" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Informe a sua nova senha
            </Text>
            <Text color="gray500">Redefina a sua segurança escolhendo uma senha forte</Text>
          </Flex>
        </Flex>
        <PasswordInput
          label="Senha"
          placeholder="Sua senha"
          value={data.new_password}
          onInputChange={(value) => onInputChange('new_password', value)}
          error={errors.new_password}
          passStrong={2}
          onPassStrongReached={() => setPasswordIsStronger(true)}
          onPassStrongUnreached={() => setPasswordIsStronger(false)}
        />
        <PasswordInput
          label="Confirmar senha"
          placeholder="Sua senha"
          value={data.password_confirmation}
          onInputChange={(value) => onInputChange('password_confirmation', value)}
          error={errors.password_confirmation}
        />
        <Flex
          color="white"
          align="center"
          justify="center"
          borderRadius="8px"
          padding="10px 18px"
          onClick={() => submit(handleRecoverPassword)}
          cursor={canRedefine ? 'pointer' : 'not-allowed'}
          bg={canRedefine ? 'primary900' : 'gray400'}
          pointerEvents={canRedefine ? 'auto' : 'none'}
        >
          <Text fontWeight="600">Redefinir senha</Text>
        </Flex>
      </Flex>
    ),
    PASSWORD_CHANGED: (
      <Flex direction="column" justify="space-between" h="100%">
        <Flex width="100%" marginTop="32px" gap="20px">
          <GiCheckMark fontSize="40px" style={{ bgColor: '#E0EEFF', color: '#6699FF', borderRadius: '50%', padding: '8px' }} />
        </Flex>
        <Flex padding="20px 0" width="100%" color="gray900" align="center" gap="8px">
          <Flex direction="column" gap="8px">
            <Text fontWeight="600" fontSize="20px" color="gray900">
              Senha redefinida com sucesso!
            </Text>
            <Text color="gray500">Volte a tela inicial e informe os dados de acesso atualizados</Text>
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
    RECOVER_BY_USERNAME: (
      <Flex direction="column" justify="space-between" h="100%">
        <Flex padding="12px 0 0 0" width="100%" color="gray300" pt="1.5rem" gap="8px" onClick={() => setStep('RECOVER_BY_EMAIL')} cursor="pointer">
          <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
          <Text textAlign="left">Voltar</Text>
        </Flex>
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
            value={data.identifier}
            error={errors.identifier}
            onInputChange={(value) => onInputChange('identifier', value)}
            label="Nome de usuário"
            color="gray700"
            padding="10px 14px 10px 8px"
            placeholder="Informe seu nome de usuário"
          />
        </Flex>

        <Flex width="100%" textAlign="right" display="column">
          <Text
            marginTop="-12px"
            marginBottom="8px"
            textAlign="right"
            color="error500"
            fontSize="12.5px"
            cursor="pointer"
            textDecoration="underline"
            _hover={{ filter: 'brightness(0.8)' }}
            onClick={() => setStep('RECOVER_BY_EMAIL')}
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
          <GiCheckMark fontSize="40px" style={{ bgColor: '#E0EEFF', color: '#6699FF', borderRadius: '50%', padding: '8px' }} />
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

export default RecoverPassword;
