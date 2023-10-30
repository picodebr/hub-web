import { Flex, Input, Text } from '@chakra-ui/react';
import { BiErrorCircle } from 'react-icons/bi';
import { IInputProps } from '../interfaces';

export const TextInput: React.FC<IInputProps> = ({ onInputChange, value = '', placeholder, label, error, ...rest }) => {
  return (
    <Flex direction="column">
      {!!label && (
        <Text color="text.gray" fontSize="15px" pb="0.25rem">
          {label}
        </Text>
      )}
      <Flex border="1px" borderLeft="none" borderColor="border.light" borderRadius="0 6px 6px 0">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
          border="none"
          borderLeft="4px"
          borderRadius="0 6px 6px 0"
          borderColor="secondary"
          isInvalid={!!error}
          {...rest}
        />
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
