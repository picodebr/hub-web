import { useEffect, useRef, useState } from 'react';
import { Flex, Text } from '@chakra-ui/react';

import { ICodeInputProps } from '../interfaces';

export const CodeInput: React.FC<ICodeInputProps> = ({ onFill, onChange, error, codeLength = 4 }) => {
  const [code, setCode] = useState('');

  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === 'Backspace')
        setCode((c) => {
          const newValue = c.slice(0, -1);
          if (onChange) onChange(newValue);

          return newValue;
        });

      if (e.key === 'Delete') {
        setCode('');
        if (onChange) onChange('');
      }

      const codeValue = e.key.replace(/\D/g, '');

      if (codeValue)
        setCode((c) => {
          const currentValue = c.length <= codeLength ? c.concat(codeValue) : c;

          if (onChange) onChange(currentValue.slice(0, codeLength));
          if (currentValue.length >= codeLength && onFill) onFill(currentValue.slice(0, codeLength));

          return currentValue;
        });
    };
    document.addEventListener('keydown', keydownEvent);

    return () => {
      document.removeEventListener('keydown', keydownEvent);
    };
  });

  const PseudoInputElement: React.FC<{ value?: string }> = ({ value }) => {
    return (
      <Flex
        h="80px"
        w="80px"
        borderRadius="8px"
        align="center"
        justify="center"
        color={error ? 'error500' : value !== undefined ? 'primary900' : 'gray300'}
        border={value !== undefined && !error ? '1px' : '1px'}
        borderColor={error ? 'error500' : value !== undefined ? 'primary9003' : 'gray300'}
        fontSize="48px"
        fontWeight="500"
      >
        {value || 0}
      </Flex>
    );
  };

  return (
    <Flex ref={ref as any} direction="column" gap="0.25rem">
      <Flex gap="10px">
        <PseudoInputElement value={code[0]} />
        <PseudoInputElement value={code[1]} />
        <PseudoInputElement value={code[2]} />
        <PseudoInputElement value={code[3]} />
      </Flex>
      {error && <Text color="error500">{error}</Text>}
    </Flex>
  );
};
