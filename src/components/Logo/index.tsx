import { Image, useColorMode } from '@chakra-ui/react';
import { ILogoProps } from './interfaces';

export const Logo: React.FC<ILogoProps> = ({ size = 'md' }) => {
  const { colorMode } = useColorMode();

  const sizeMapper = {
    sm: '2rem',
    md: '2.875rem',
    lg: '4rem',
    xl: '5.5rem',
    '2xl': '7rem',
  };
  return <Image src={`/logo/picode-logo-${colorMode}.svg`} h={sizeMapper[size]} />;
};

export const CoinIcon: React.FC<ILogoProps> = ({ size = 'md' }) => {
  const sizeMapper = {
    xs: '1.5rem',
    sm: '2rem',
    md: '2.3rem',
    lg: '3.3rem',
    xl: '5rem',
    '2xl': '7rem',
  };
  return <Image src="/icons/coin.svg" h={sizeMapper[size]} />;
};
