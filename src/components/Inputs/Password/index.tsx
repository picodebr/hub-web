import { Flex, Input, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { IInputProps } from '../interfaces';

export const PasswordInput: React.FC<IInputProps> = ({ value = '', placeholder, label, error, onInputChange: onChange }) => {
  const [showPass, setShowPass] = useState(false);
  return (
    <Flex direction="column" color="text.light">
      {!!label && (
        <Text color="gray700" fontSize="13.5px" pb="0.25rem" fontWeight="500">
          {label}
        </Text>
      )}
      <Flex border="1px" borderColor="gray300" borderRadius="6px">
        <Input
          type={showPass ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          border="none"
          padding="10px 14px 10px 14px"
          borderRadius="8px"
          isInvalid={!!error}
          variant="unstyled"
          fontSize="16px"
        />
        <Flex color='gray300' align="center" fontSize="1.2rem" p="0 6px 0 2px" cursor="pointer" onClick={() => setShowPass((e) => !e)}>
          {showPass ? <BsEyeSlash /> : <BsEye />}
        </Flex>
      </Flex>
      {!!error && (
        <Flex align="center" gap="0.25rem" color="error500">
          <Text fontSize="12.5px">{error}</Text>
        </Flex>
      )}
    </Flex>
  );
};
