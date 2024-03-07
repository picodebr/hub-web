import { ButtonProps } from '@chakra-ui/react';

export interface IPlusButtonProps extends ButtonProps {
  label: string;
  warning?: boolean;
}
