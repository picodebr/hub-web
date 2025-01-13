import {
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from '@chakra-ui/react';
import { IInputProps } from '../interfaces';

export const NumberInput: React.FC<IInputProps> = ({ onInputChange, value = '', placeholder, label, error, rightElement, leftElement, ...rest }) => {
  return (
    <Flex direction="column" w="100%">
      {!!label && (
        <Text color="gray700" fontSize="13.5px" fontWeight="500" pb="0.25rem">
          {label}
        </Text>
      )}
      <Flex border="1px" borderColor="gray300" borderRadius="6px">
        {!!leftElement && (
          <Flex align="center" fontSize="1.2rem" p="0 2px 0 12px">
            {leftElement}
          </Flex>
        )}
        <ChakraNumberInput
          size="sm"
          value={value}
          placeholder={placeholder}
          onChange={(e) => !!onInputChange && onInputChange(e)}
          border="none"
          borderColor="gray300"
          sx={{ '*': { borderColor: 'gray300' } }}
          padding="10px 10px 10px 6px"
          w="100%"
          borderRadius="8px"
          isInvalid={!!error}
          variant="unstyled"
          {...(rest as any)}
        >
          <NumberInputField borderRadius="md" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </ChakraNumberInput>
        {!!rightElement && (
          <Flex align="center" fontSize="1.2rem" p="0 6px 0 2px">
            {rightElement}
          </Flex>
        )}
      </Flex>
      {!!error && (
        <Flex align="center" gap="0.25rem" pl="0.15rem" color="error500">
          <Text fontSize="12.5px">{error}</Text>
        </Flex>
      )}
    </Flex>
  );
};
