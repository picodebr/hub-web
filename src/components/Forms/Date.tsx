/* eslint-disable react/display-name */

import { Input, InputProps } from '@chakra-ui/react';
import React, { forwardRef } from 'react';

interface IDateInputProps extends InputProps {
  _type?: 'datetime-local' | 'date';
}

export const DateInput = forwardRef(({ _type = 'datetime-local', ...rest }: IDateInputProps, ref) => {
  return <Input ref={ref as React.Ref<any>} type={_type} {...rest} color="gray.500" borderColor="border.medium" />;
});
