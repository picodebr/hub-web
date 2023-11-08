import { Flex, Input, Text } from '@chakra-ui/react';
import { IInputProps } from '../interfaces';

export const TextInput: React.FC<IInputProps> = ({ onInputChange, value = '', placeholder, label, error, rightElement, leftElement, ...rest }) => {
  return (
    <Flex direction="column" color="text.light">
      {!!label && (
        <Text color="text.black" fontSize="13.5px" fontWeight="500" pb="0.25rem">
          {label}
        </Text>
      )}
      <Flex border="1px" borderColor="border.light" borderRadius="6px">
        {!!leftElement && (
          <Flex align="center" fontSize="1.2rem" p="0 2px 0 6px">
            {leftElement}
          </Flex>
        )}
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
          border="none"
          borderRadius="6px"
          isInvalid={!!error}
          variant="unstyled"
          padding="0.35rem 0.5rem"
          fontSize="15px"
          {...rest}
        />
        {!!rightElement && (
          <Flex align="center" fontSize="1.2rem" p="0 6px 0 2px">
            {rightElement}
          </Flex>
        )}
      </Flex>
      {!!error && (
        <Flex align="center" gap="0.25rem" color="status.error">
          <Text fontSize="12.5px">{error}</Text>
        </Flex>
      )}
    </Flex>
  );
};
