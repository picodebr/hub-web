/* eslint-disable prefer-const */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import { IScratchNewBlockModalProps, IScratchNewBlockShared } from './interfaces';

import {
  BlocklyArea,
  ButtonsContainer,
  Header,
  Button,
  ButtonImage,
  ButtonText,
  Footer,
  Modal,
  ModalWrapper,
  FooterButton,
  Content,
  GlobalStyles,
  ErrorContainer,
} from './styles';

import booleanImage from './images/boolean_input.svg';
import numberImage from './images/number_input.svg';
import labelImage from './images/text_label.svg';
import { useBlockly } from '@/_base/hooks';

const preventDuplicateNames = (names: string[]) => {
  const newNames: string[] = [];

  names.forEach((name) => {
    let n = name || 'a';

    for (let i = 2; newNames.includes(n); i += 1) n = `${name || 'a'} ${i}`;

    newNames.push(n);
  });

  return newNames;
};

const duplicateBlockMessage = 'Bloco já existente. Por favor, renomeie-o.';

export const ScratchNewBlockModal: React.FC<IScratchNewBlockModalProps> = ({ onUpdate, procedureCodes }) => {
  const Blockly = useBlockly();
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const scratchShared = useRef<IScratchNewBlockShared>({
    callback: null,
    mutationRoot: null,
    mutation: null,
  });

  useEffect(() => {
    if (!Blockly) return;

    Blockly.Procedures.externalProcedureDefCallback = (mutation_: any, cb: any) => {
      scratchShared.current.mutation = mutation_;
      scratchShared.current.callback = cb;
      setShow(true);
    };
  }, [Blockly]);

  useEffect(() => setError(''), [show]);

  const workspace = useRef<any>(null);

  useEffect(() => {
    if (!Blockly || !show) return;

    workspace.current = Blockly.inject('new-block-modal-blockly-area', {
      media: '/scratch/media/',
      scrollbars: true,
    });

    workspace.current.addChangeListener(() => {
      if (scratchShared.current.mutationRoot) {
        scratchShared.current.mutationRoot.onChangeFn();
      }
    });

    workspace.current.clear();
    scratchShared.current.mutationRoot = workspace.current.newBlock('procedures_declaration');
    scratchShared.current.mutationRoot.domToMutation(scratchShared.current.mutation);
    scratchShared.current.mutationRoot.initSvg();
    scratchShared.current.mutationRoot.render(false);
    workspace.current.scrollCenter();
  }, [Blockly, show]);

  const handleSave = () => {
    if (!scratchShared.current.callback) return;

    const mutation = scratchShared.current.mutationRoot.mutationToDom(true);

    if (procedureCodes.includes(mutation.attributes.proccode.value)) {
      setError(duplicateBlockMessage);
      return;
    }

    const args = JSON.parse(mutation.attributes[3].nodeValue);
    const parsedArgs = preventDuplicateNames(args);
    mutation.attributes[3].nodeValue = JSON.stringify(parsedArgs);
    scratchShared.current.callback(mutation);
    scratchShared.current.callback = null;
    scratchShared.current.mutationRoot = null;
    workspace.current.clear();
    onUpdate();
    setShow(false);
  };

  const addLabel = () => {
    workspace.current.scrollX -= 65;
    scratchShared.current.mutationRoot.addLabelExternal();
  };

  const addBoolean = () => {
    workspace.current.scrollX -= 96;
    scratchShared.current.mutationRoot.addBooleanExternal();
  };

  const addNumber = () => {
    workspace.current.scrollX -= 84;
    scratchShared.current.mutationRoot.addStringNumberExternal();
  };

  const handleCancel = useCallback(() => {
    scratchShared.current.callback = null;
    scratchShared.current.mutationRoot = null;
    workspace.current.clear();
    setShow(false);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) return () => ({});

    const handleWrapperClick = (e: Event) => e.target === wrapper && handleCancel();

    wrapper.addEventListener('mousedown', handleWrapperClick);
    wrapper.addEventListener('touchstart', handleWrapperClick);

    return () => {
      wrapper.removeEventListener('mousedown', handleWrapperClick);
      wrapper.removeEventListener('touchstart', handleWrapperClick);
    };
  }, [handleCancel]);

  useEffect(() => {
    if (!show) return () => ({});

    const handleWindowKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && handleCancel();

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [handleCancel, show]);

  return (
    <ModalWrapper ref={wrapperRef} data-show={show}>
      {show && (
        <Modal>
          <Header>Crie um bloco</Header>

          <Content>
            <BlocklyArea id="new-block-modal-blockly-area" />

            <ButtonsContainer>
              <Button onClick={addNumber}>
                <ButtonImage src={numberImage} />
                <ButtonText>Inserir entrada numérica</ButtonText>
              </Button>

              <Button onClick={addBoolean}>
                <ButtonImage src={booleanImage} />
                <ButtonText>Inserir entrada booleana</ButtonText>
              </Button>

              <Button onClick={addLabel}>
                <ButtonImage src={labelImage} />
                <ButtonText>Inserir texto</ButtonText>
              </Button>
            </ButtonsContainer>
          </Content>

          <ErrorContainer data-show={!!error}>
            <BiErrorCircle />
            {error}
          </ErrorContainer>

          <Footer>
            <FooterButton onClick={handleCancel}>Cancelar</FooterButton>
            <FooterButton onClick={handleSave} data-confirm>
              Salvar
            </FooterButton>
          </Footer>
        </Modal>
      )}
      <GlobalStyles />
    </ModalWrapper>
  );
};
