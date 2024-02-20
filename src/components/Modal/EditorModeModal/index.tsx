import React from 'react';
import { GenericModal } from '../GenericModal';
import { IEditorModeModalProps } from './interfaces';

import { Header, Text, TextHightlight } from './styles';

export const EditorModeModal: React.FC<IEditorModeModalProps> = ({
  show,
  onClose,
}) => (
  <GenericModal
    show={show}
    onClose={() => onClose(false)}
    onSave={() => onClose(true)}
    confirmButtonTitle="Continuar"
    cancelButtonTitle="Cancelar"
  >
    <Header>Atenção!</Header>
    <Text>
      Este processo é irreversível. Ao continuar, recursos como{' '}
      <TextHightlight>Simulação 3D</TextHightlight> e{' '}
      <TextHightlight>Editor de Blocos</TextHightlight> não estarão disponíveis.
    </Text>
  </GenericModal>
);
