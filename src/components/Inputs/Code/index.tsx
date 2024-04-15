import { useEffect, useRef, useState } from 'react';
import { Flex, PinInput, PinInputField, Text } from '@chakra-ui/react';

import { ICodeInputProps } from '../interfaces';

export const CodeInput: React.FC<ICodeInputProps> = ({ onFill, onChange, error, codeLength = 4 }) => {
  const [code, setCode] = useState('');

  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (code.length === codeLength && onFill) onFill(code);
    console.log('code: ', code.length);
    if (onChange) onChange(code);
  }, [code]);

  return (
    <Flex ref={ref as any} direction="column" gap="0.25rem">
      <Flex gap="10px">
        <PinInput value={code} onChange={setCode} size="lg">
          {Array.from({ length: codeLength }).map((_, i) => (
            <PinInputField key={`n_input_${i + 1}`} borderColor="gray300" />
          ))}
        </PinInput>
      </Flex>
      {error && <Text color="error500">{error}</Text>}
    </Flex>
  );
};
