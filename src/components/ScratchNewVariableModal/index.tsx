/* eslint-disable prefer-const */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IScratchNewVariableModalProps } from './interfaces';

import { Header, Footer, Modal, ModalWrapper, FooterButton, Content, NameInput, NameError } from './styles';

const variableNameRegex = /^[a-zA-Z]+[a-zA-Z0-9_]{0,}$/;

export const ScratchNewVariableModal: React.FC<IScratchNewVariableModalProps> = ({ show, variables, onClose }) => {
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) return () => ({});

    const handleWrapperClick = (e: Event) => e.target === wrapper && onClose();

    wrapper.addEventListener('mousedown', handleWrapperClick);
    wrapper.addEventListener('touchstart', handleWrapperClick);

    return () => {
      wrapper.removeEventListener('mousedown', handleWrapperClick);
      wrapper.removeEventListener('touchstart', handleWrapperClick);
    };
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (variables.includes(name)) return;

    setError('');
    setName('');
    onClose(name);
  }, [name, onClose, variables]);

  const handleCancel = useCallback(() => {
    setError('');
    setName('');
    onClose();
  }, [onClose]);

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newName = e.target.value.trim();
    if (!newName || variableNameRegex.test(newName)) setName(newName);
  };

  const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    e.key === 'Enter' && handleSave();
  };

  useEffect(() => {
    if (!show) return () => ({});

    const handleWindowKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && handleCancel();

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [handleCancel, show]);

  useEffect(() => {
    const errorMessage = 'Variável já existente. Escolha outro nome.';
    setError(variables.includes(name) ? errorMessage : '');
  }, [name, variables]);

  return (
    <ModalWrapper ref={wrapperRef} data-show={show}>
      <Modal>
        <Header>Crie uma variável</Header>

        <Content>
          <NameInput value={name} onChange={handleNameChange} placeholder="nome" onKeyDown={handleInputKeyDown} />
          <NameError>{error}</NameError>
        </Content>

        <Footer>
          <FooterButton onClick={handleCancel}>Cancelar</FooterButton>
          <FooterButton onClick={handleSave} data-confirm>
            Salvar
          </FooterButton>
        </Footer>
      </Modal>
    </ModalWrapper>
  );
};
