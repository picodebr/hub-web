import { ImageProps } from '@chakra-ui/react';

export interface ILogoProps extends ImageProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'xs';
}
