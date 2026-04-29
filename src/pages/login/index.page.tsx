/* eslint-disable no-console */
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

import { useAsyncCallback, useAuth, useCustomToast, useInputHandler, useLoading } from '@/_base/hooks';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { googleLogin, hubLogin, validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { IAuthRequest, authSchema } from '@/_base/interfaces/auth';
import { api } from '@/_base/classes/api';
import { Logo } from '@/components/Logo';
import { AuthBackground } from '@/components/AuthBackground';

const LoginPage: React.FC = () => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [keepLogged, setKeepLogged] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { errors, onInputChange, data, submit } = useInputHandler<IAuthRequest>({ schema: authSchema });
  const { setLoadingConfig } = useLoading();
  const { setUser } = useAuth();
  const router = useCustomRouter();
  const toast = useCustomToast();

  const handleLogin = useAsyncCallback(
    async (googleAccessToken?: string) => {
      setSubmitLoading(true);

      try {
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
      } catch (err: any) {
        logError('LoginPage', err);
        toast({ status: 'error', description: 'Erro ao fazer login. Tente novamente.' });
      }
    },
    [router],
    false,
    () => setSubmitLoading(false),
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background com Blobs */}
      <AuthBackground />

      {/* Container Glassmorphism Central */}
      <div className="glass-card w-full max-w-[420px] md:max-w-[400px] p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Logo */}
            <div className="flex justify-center">
              <Logo size="sm" />
            </div>

            {/* Signup Link */}
            <div className="text-center text-sm text-muted-foreground">
              Ainda não tem uma conta?{' '}
              <a href="/signup" className="link-animated">
                Cadastre-se
              </a>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              {/* Username/Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Nome de Usuário ou E-mail</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    className={`apple-input pl-10 ${errors.identifier ? 'input-error' : ''}`}
                    placeholder="Nome de Usuário"
                    value={data?.identifier}
                    onChange={(e) => onInputChange('identifier', e.target.value.trim().toLowerCase())}
                  />
                </div>
                {errors.identifier && <span className="text-xs text-destructive">{errors.identifier}</span>}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Senha</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`apple-input pl-10 pr-12 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Sua senha"
                    value={data?.password}
                    onChange={(e) => onInputChange('password', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-destructive">{errors.password}</span>}
              </div>

              {/* Help Link */}
              <a href="/help" className="text-xs text-destructive cursor-pointer hover:underline transition-colors">
                Não estou conseguindo acessar
              </a>
            </div>

            {/* Keep Logged Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="keepLogged"
                checked={keepLogged}
                onChange={(e) => setKeepLogged(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="keepLogged" className="text-sm font-medium text-foreground cursor-pointer user-select-none">
                Mantenha-me conectado
              </label>
            </div>

            {/* Login Button */}
            <button className="apple-btn mt-2" onClick={() => submit(handleLogin)} disabled={submitLoading}>
              {submitLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
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
