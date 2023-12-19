import { Image, useColorMode } from '@chakra-ui/react';
import { ILogoProps } from './interfaces';

export const Logo: React.FC<ILogoProps> = ({ size = 'md' }) => {
  const { colorMode } = useColorMode();

  const sizeMapper = {
    sm: '2rem',
    md: '3rem',
    lg: '4rem',
    xl: '5.5rem',
    '2xl': '7rem',
  };
  return <Image src={`/logo/picode-logo-${colorMode}.svg`} h={sizeMapper[size]} />;
};
