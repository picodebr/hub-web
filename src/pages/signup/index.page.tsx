import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';

import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { IReCAPTCHAData } from '@/_base/interfaces/auth/IReCaptchaData';
import { HubUserType } from '@/_base/interfaces/user/HubUserType';
import IRegisterUser, { EMPTY_REGISTER_USER_DATA, registerUserSchema } from '@/_base/interfaces/user/IRegisterUser';
import { cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { IGoogleUserData } from '@/_base/interfaces/auth/IGoogleUserData';
import { checkEmail, checkPrimaryCode, checkUsername, signup } from '@/_base/services/user';
import { listAvailableSchools } from '@/_base/services/school';
import { UserTypeStep } from './components/UserType';
import { PrimaryCodeStep } from './components/PrimaryCode';
import { SchoolCodeStep } from './components/SchoolCode';
import { FormStep } from './components/Form';
import { FinishStep } from './components/Finish';
import { SignUpPageStepsType } from './interfaces';
import { InputValueType } from '@/_base/interfaces/shared';
import { usernameChecker } from '@/_base/utils/usernameUtils';

const SizeMapper: Record<SignUpPageStepsType, string> = {
  USER_TYPE: '28.5rem',
  PRIMARY_CODE: '35.25rem',
  SCHOOL_CODE: '28.5rem',
  FORM: 'fit-content',
  FINISH: '23.5rem',
};

const SignUp: React.FC = () => {
  const [step, setStep] = useState<SignUpPageStepsType>('USER_TYPE');
  const [userType, setUserType] = useState<HubUserType>();
  const [captcha, setCaptcha] = useState<IReCAPTCHAData>({ token: null });
  const [primaryCode, setPrimaryCode] = useState<InputValueType<string>>({ value: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isGoogleSignin, setIsGoogleSignin] = useState(false);
  const [passwordIsValid, setPasswordIsValid] = useState(false);
  const [availableSchools, setAvailableSchools] = useState<{ value: string; label: string }[]>([]);

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
    if (primaryCode.value) (async () => await handleCheckCode(primaryCode.value || ''))();
  }, [captcha.token, primaryCode.value]);

  const canSubmit = useMemo(
    () =>
      passwordIsValid &&
      data.password === data.password_confirmation &&
      !Object.values(Object.assign(EMPTY_REGISTER_USER_DATA, { ...data, email: '_' })).filter((e) => !e).length,
    [passwordIsValid, data],
  );

  const handleCheckCode = useAsyncCallback(
    async (code: string) => {
      if (!userType) return;

      try {
        // TODO: send request to backend
        const { is_valid } = await checkPrimaryCode(userType, code);

        if (!is_valid) {
          setPrimaryCode({ value: '', error: 'Código inválido' });
          return;
        }
        const schools = await listAvailableSchools(code);

        setAvailableSchools(schools.map((s) => ({ label: s.name, value: s.code })));

        setData((e) => ({ ...e, primary_code: code }));
        setPrimaryCode((e) => ({ ...e, valid: true }));
      } catch {
        setPrimaryCode({ value: '', error: 'Código inválido' });
      }
    },
    [userType],
    true,
  );

  const handleRegisterUser = useAsyncCallback(
    async () => {
      if (data.password !== data.password_confirmation) {
        setErrors((e) => ({ ...e, password: 'As senhas não correspondem', password_confirmation: 'As senhas não correspondem' }));
        return;
      }

      if (!usernameChecker(data.username)) {
        setErrors((e) => ({
          ...e,
          username: 'O nome de usuário pode conter somente letras, números e os caracteres especiais ( - ) e ( _ )',
        }));
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
      if (!signupData.email) signupData.email = null;

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
    setPrimaryCode({ value: '' });
    setData((e) => ({ ...e, user_type: type }));
    setStep('PRIMARY_CODE');
  };

  const PageStepElement: Record<SignUpPageStepsType, ReactNode> = {
    USER_TYPE: <UserTypeStep onUserTypeChange={handleUserTypeChange} />,
    PRIMARY_CODE: <PrimaryCodeStep primaryCode={primaryCode} userType={userType} setPrimaryCode={setPrimaryCode} setStep={setStep} />,
    SCHOOL_CODE: <SchoolCodeStep availableSchools={availableSchools} onInputChange={onInputChange} primaryCode={primaryCode} setStep={setStep} />,
    FORM: (
      <FormStep
        data={data}
        errors={errors}
        onInputChange={onInputChange}
        isGoogleSignin={isGoogleSignin}
        setPasswordIsValid={setPasswordIsValid}
        submit={submit}
        canSubmit={canSubmit}
        handleRegisterUser={handleRegisterUser}
        submitLoading={submitLoading}
        userType={userType}
      />
    ),
    FINISH: <FinishStep userType={userType} />,
  };

  return (
    <Flex
      direction="column"
      bgColor="white"
      height="fit-content"
      maxW="420px"
      margin="auto"
      borderRadius="12px"
      
      align="center"
      padding="24px"
      transition="all 0.2s"
      overflow="hidden"
      mx={{ base: '1rem', md: 'auto' }}
      h={SizeMapper[step]}
    >
      <Logo />

      {PageStepElement[step]}
    </Flex>
  );
};

export default SignUp;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const selectedPage = 'signup';

  cookieManager.forceTokenExpires(res);

  return { props: { selectedPage, pageTitle: 'Cadastro' } };
};
