import React, { useEffect, useRef, useState, memo, useCallback } from 'react';
import * as Yup from 'yup';

import { ISimulationCodeData, ISimulationCodeModal } from './interfaces';
import { CodeContainer, EmailButton, EmailContainer, EmailTitle, Logo, NoCodeButton, Wrapper } from './styles';

import { useCustomToast } from '../../../_base/hooks';
import { getValidationError, isProduction, showErrorToClient } from '@/_base/utils';
import { requestCode } from '@/_base/services/code/requestCode';
import { addCode } from '@/_base/services/code/addCode';
import { TextInput } from '@/components/Inputs/Text';
import { HubCodeInput } from '@/components/Inputs/HubCode';

const initialData: ISimulationCodeData = {
  code: '',
  name: '',
  email: '',
};

export const SimulationCodeModal: React.FC<ISimulationCodeModal> = memo(function SimulationCodeModal_({ show, onClose }) {
  const [data, setData] = useState<ISimulationCodeData>(initialData);
  const [errors, setErrors] = useState<ISimulationCodeData>(initialData);
  const [showEmail, setShowEmail] = useState(false);
  const toast = useCustomToast();

  useEffect(() => {
    setErrors({ ...initialData });
  }, [data]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = wrapperRef.current;
    if (!ref || !show) return () => ({});

    const handler = (e: Event) => {
      if (e.target !== ref) return;

      onClose(null);
      setShowEmail(false);
    };

    ref.addEventListener('mousedown', handler);
    ref.addEventListener('touchstart', handler);

    return () => {
      ref.removeEventListener('mousedown', handler);
      ref.removeEventListener('touchstart', handler);
    };
  }, [onClose, show]);

  const sendEmail = async () => {
    try {
      const sendData = {
        name: data.name.trim(),
        email: data.email.trim(),
      };

      const dataShape = Yup.object().shape({
        name: Yup.string().min(3, 'Comprimento mínimo de 3 caracteres').required('Campo obrigatório'),

        email: Yup.string().email('Email inválido').required('Campo obrigatório'),
      });

      await dataShape.validate(sendData, { abortEarly: false });

      await requestCode(sendData);

      toast({
        status: 'success',
        description: 'Código pedido com sucesso. Em breve você receberá um email com as instruções para utilizá-lo.',
        duration: 5000,
      });

      onClose(null);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = getValidationError(err);
        setErrors(() => ({ ...initialData, ...validationErrors }));
        return;
      }

      showErrorToClient(err, toast);
    }
  };

  useEffect(() => {
    const formmatedCode = data.code.replace(/-/g, '');

    if (formmatedCode.length !== 16) return;

    const checkCode = async () => {
      try {
        const user = await addCode(formmatedCode);
        onClose(user);
      } catch (err) {
        setErrors((e) => ({ ...e, code: 'Código inválido' }));
      }
    };

    checkCode();
    setShowEmail(false);
  }, [data, toast, onClose]);

  const updateData = useCallback((newData: Partial<ISimulationCodeData>) => {
    setData((e) => ({ ...e, ...newData }));
  }, []);

  return show ? (
    <Wrapper ref={wrapperRef}>
      {showEmail ? (
        <EmailContainer>
          <EmailTitle>Obter um código de acesso</EmailTitle>
          <TextInput label="Nome" value={data.name} error={errors.name} onInputChange={(name) => updateData({ name })} />
          <TextInput label="Email" value={data.email} error={errors.email} onInputChange={(email) => updateData({ email })} />
          <EmailButton onClick={sendEmail}>Enviar</EmailButton>
        </EmailContainer>
      ) : (
        <CodeContainer>
          <Logo src="/logo/pi-logo-light.svg" />
          <HubCodeInput code={data.code} error={errors.code} setCode={(code) => updateData({ code })} />
          <NoCodeButton onClick={() => setShowEmail(true)} data-hide={isProduction()}>
            Não tenho o código
          </NoCodeButton>
        </CodeContainer>
      )}
    </Wrapper>
  ) : null;
});
