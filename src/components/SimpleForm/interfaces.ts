import { TooltipProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface ISimpleFormItem {
  children: ReactNode;
  label: ReactNode;
  required?: boolean;
  tooltip?: Omit<TooltipProps, 'children'>;
}

export interface ISimpleFormProps {
  items: ISimpleFormItem[];
  itemHeight?: string;
}
