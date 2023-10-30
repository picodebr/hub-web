import { InputProps } from '@chakra-ui/react';

export interface IInputProps extends InputProps {
  onInputChange: (value: string) => void;
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
}
