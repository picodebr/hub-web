import { Image } from '@chakra-ui/react';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { ILogoProps } from './interfaces';

export const Logo: React.FC<ILogoProps> = ({ size = 'md', variant = `full`, forceTheme, ...rest }) => {
  const { colorMode } = useDarkMode();

  const sizeMapper = {
    xs: '1.3rem',
    sm: '2rem',
    md: '2.875rem',
    lg: '4rem',
    xl: '5.5rem',
    '2xl': '7rem',
  };
  return <Image src={`/logo/${variant === `full` ? 'picode-logo' : 'pi-logo'}-${forceTheme || colorMode}.svg`} h={sizeMapper[size]} {...rest} />;
};

export const CoinIcon: React.FC<ILogoProps> = ({ size = 'md', ...rest }) => {
  const sizeMapper = {
    xs: '1.5rem',
    sm: '2rem',
    md: '2.3rem',
    lg: '3.3rem',
    xl: '5rem',
    '2xl': '7rem',
  };
  return <Image src="/icons/coin.svg" h={sizeMapper[size]} {...rest} />;
};
