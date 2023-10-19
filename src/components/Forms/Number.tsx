/* eslint-disable react/display-name */

import { InputProps, NumberInput, NumberInputField } from '@chakra-ui/react';
import React, { forwardRef } from 'react';

interface INumberInputProps extends InputProps {
  prefix?: string;
}

export const AppNumberInput = forwardRef(({ prefix, ...rest }: INumberInputProps, ref) => {
  return (
    <NumberInput
      ref={ref as React.Ref<any>}
      border="none"
      display="flex"
      alignItems="center"
      gap="0.5rem"
      w="100%"
      color="gray.500"
      {...(rest as any)}
    >
      {prefix || ''}
      <NumberInputField border="none" padding="0" color="gray.500" />
    </NumberInput>
  );
});
