/* eslint-disable react/display-name */
import { Flex, Select, SelectProps, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form/dist/types';

interface IAppSelect {
  label?: string;
  children?: any;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  w?: string | number;
  description?: string;
}

const baseColor = 'gray.500';
const errorColor = '#BA1B1B';
const placeholderColor = '#AAA4B8';
const borderColor = '#6D23F8';

export const AppSelect = forwardRef(({ children, error, label, w, description, ...otherProps }: IAppSelect & SelectProps, ref) => (
  <Flex w={w ? w : '100%'} flexDirection="column" gap={1} color={baseColor} position="relative">
    {label ? <Text fontSize="14px">{label}</Text> : null}
    <Select
      ref={ref as React.Ref<any>}
      variant="outline"
      isInvalid={error ? true : false}
      errorBorderColor={errorColor}
      borderColor={baseColor}
      color={baseColor}
      fontSize="13px"
      bg="white"
      _placeholder={{ opacity: 0.5 }}
      _focus={{ borderColor, outline: 'none' }}
      _focusVisible={{ outline: 'none' }}
      {...otherProps}
    >
      {children}
    </Select>
    {error ? (
      <Text fontSize={12} color={errorColor}>
        {error.message as string}
      </Text>
    ) : null}
    {description ? (
      <Text paddingX={2} fontSize="13px" opacity={0.5}>
        {description}
      </Text>
    ) : null}
  </Flex>
));
