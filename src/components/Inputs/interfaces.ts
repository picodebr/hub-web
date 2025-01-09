import { InputProps } from '@chakra-ui/react';
import { HTMLAttributes, ReactNode } from 'react';
import { Props as SelectProps } from 'react-select';

export interface IInputProps extends InputProps {
  onInputChange?: (value: string) => void;
  value?: string | number;
  placeholder?: string;
  label?: string;
  error?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export interface ICodeInputProps {
  onFill?: (value: string) => void;
  onChange?: (value: string) => void;
  codeLength?: number;
  error?: string;
}

export interface IRadioInputProps extends HTMLAttributes<HTMLElement> {
  title: string;
  name?: string;
  initialValue?: string;
  options: OptionType[];
  isHorizontal?: boolean;
  checkedValue?: string;
  onInputChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}
export interface ISelectProps extends SelectProps {
  options?: OptionType[];
  title?: string;
  initialValue?: OptionType[];
  isMultiSelect?: boolean;
  isCreatable?: boolean;
  placeholder?: string;
  onSelectChange?: (options: string[]) => void;
  instanceId: string | number;
  backgroundColor?: string;
  error?: string;
}

export type OptionType = { value: string; label: string };
