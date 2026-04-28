import { ReactNode, useEffect, useMemo, useState, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { AnimatePresence, motion } from 'framer-motion';

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
import { AuthBackground } from '@/components/AuthBackground';

type Step = SignUpPageStepsType;

const SignUp: React.FC = () => {
  const [step, setStep] = useState<Step>('USER_TYPE');
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

  const goToLogin = useCallback(() => {
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const data = cookieManager.getCookie<IGoogleUserData>('google_data', true);

    if (data) {
      setIsGoogleSignin(true);
      setData((e) => ({ ...e, email: data.email, name: data.name }));
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

  const PageStepElement: Record<Step, ReactNode> = {
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background com Blobs */}
      <AuthBackground />

      {/* Container Glassmorphism Central */}
      <div className="glass-card w-full max-w-[420px] md:max-w-[400px] p-8 relative z-10">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size="sm" />
          </div>

          {/* Animated Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {PageStepElement[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const selectedPage = 'signup';

  cookieManager.forceTokenExpires(res);

  return { props: { selectedPage, pageTitle: 'Cadastro' } };
};
