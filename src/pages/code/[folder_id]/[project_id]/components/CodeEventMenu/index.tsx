import React from 'react';

import { ICodeEventMenuProps } from './interfaces';

import { codeEventButtonTypes } from '../CodeEventButton/interfaces';
import { CodeEventButton } from '../CodeEventButton';
import { Flex } from '@chakra-ui/react';

export const CodeEventMenu: React.FC<ICodeEventMenuProps> = ({ allowUpload, isTextMode, onClick }) => (
  <Flex
    justify="flex-end"
    align="center"
    p="0 1rem"
    columnGap="0.75rem"
    position="absolute"
    zIndex="9999"
    right="2.5rem"
    top="4.5rem"
    bg="white"
    borderRadius="md"
    border="1px"
    borderColor="gray300"
  >
    {codeEventButtonTypes.map((type) => (
      <CodeEventButton
        key={type}
        type={type}
        onClick={() => onClick(type)}
        hide={
          // (type === 'simulation' && (!isSignedIn || isTextMode)) ||
          // (type === 'save' && !isProjectOwner) ||
          // (type === 'duplicate' && isProjectOwner) ||
          // (type === 'toText' && isTextMode)
          type === `duplicate` || (type === `toText` && isTextMode)
        }
        disabled={type === 'upload' && !allowUpload}
      />
    ))}
  </Flex>
);
