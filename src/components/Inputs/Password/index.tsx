import { Flex, Input, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { IInputProps } from '../interfaces';

export const PasswordInput: React.FC<IInputProps> = ({ value = '', placeholder, label, error, onInputChange: onChange }) => {
  const [showPass, setShowPass] = useState(false);
  return (
    <Flex direction="column" color="text.light">
      {!!label && (
        <Text color="text.black" fontSize="13.5px" pb="0.25rem" fontWeight="500">
          {label}
        </Text>
      )}
      <Flex border="1px" borderColor="border.light" borderRadius="6px">
        <Input
          type={showPass ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          border="none"
          borderRadius="6px"
          isInvalid={!!error}
          variant="unstyled"
          fontSize="15px"
          padding="0.35rem 0.5rem"
        />
        <Flex align="center" fontSize="1.2rem" p="0 6px 0 2px" cursor="pointer" onClick={() => setShowPass((e) => !e)}>
          {showPass ? <BsEyeSlash /> : <BsEye />}
        </Flex>
      </Flex>
      {!!error && (
        <Flex align="center" gap="0.25rem" color="status.error">
          <BiErrorCircle />
          <Text fontSize="14px">{error}</Text>
        </Flex>
      )}
    </Flex>
  );
};
