import React from 'react';

import { ICodeEventMenuProps } from './interfaces';

import { Container } from './styles';
import { codeEventButtonTypes } from '../CodeEventButton/interfaces';
import { CodeEventButton } from '../CodeEventButton';

export const CodeEventMenu: React.FC<ICodeEventMenuProps> = ({ allowUpload, isProjectOwner, isSignedIn, isTextMode, onClick }) => (
  <Container>
    {codeEventButtonTypes.map((type) => (
      <CodeEventButton
        key={type}
        type={type}
        onClick={() => onClick(type)}
        hide={
          (type === 'simulation' && (!isSignedIn || isTextMode)) ||
          (type === 'save' && !isProjectOwner) ||
          (type === 'duplicate' && isProjectOwner) ||
          (type === 'toText' && isTextMode)
        }
        disabled={type === 'upload' && !allowUpload}
      />
    ))}
  </Container>
);
