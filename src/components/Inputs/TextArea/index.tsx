import { Flex, Text, Textarea } from '@chakra-ui/react';
import { BiErrorCircle } from 'react-icons/bi';
import { IInputProps } from '../interfaces';

export const TextAreaInput: React.FC<IInputProps> = ({
  onInputChange,
  value = '',
  placeholder,
  label,
  error,
  rightElement,
  leftElement,
  ...rest
}) => {
  return (
    <Flex direction="column" color="text.light">
      {!!label && (
        <Text color="gray700" fontSize="13.5px" fontWeight="500" pb="0.25rem">
          {label}
        </Text>
      )}
      <Flex border="1px" borderColor="gray300" borderRadius="6px">
        {!!leftElement && (
          <Flex align="center" fontSize="1.2rem" p="0 2px 0 6px">
            {leftElement}
          </Flex>
        )}
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
          border="none"
          padding="10px 10px 10px 6px"
          borderRadius="6px"
          isInvalid={!!error}
          variant="unstyled"
          fontSize="16px"
          {...(rest as any)}
        />
        {!!rightElement && (
          <Flex align="center" fontSize="1.2rem" p="0 6px 0 2px">
            {rightElement}
          </Flex>
        )}
      </Flex>
      {!!error && (
        <Flex align="center" gap="0.25rem" color="error500">
          <BiErrorCircle />
          <Text fontSize="14px">{error}</Text>
        </Flex>
      )}
    </Flex>
  );
};
