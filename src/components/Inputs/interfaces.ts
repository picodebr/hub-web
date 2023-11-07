import { InputProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface IInputProps extends InputProps {
  onInputChange: (value: string) => void;
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}
