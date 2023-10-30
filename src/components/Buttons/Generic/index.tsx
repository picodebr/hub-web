import { IGenericButton } from './interfaces';

import { Button, ButtonProps } from '@chakra-ui/react';

export const GenericButton = ({ label, btntype, ...otherProps }: IGenericButton & ButtonProps) => {
  const getBtnColor = () => {
    switch (btntype) {
      case 'primary':
        return '#2a075d';
      case 'outline':
        return 'transparent';
      case 'outline-white':
        return 'white';
      case 'warning':
        return '#BA1B1B';
      case 'outline-warning':
        return 'transparent';
      default:
        return '#2a075d';
    }
  };

  const getBtnTextColor = () => {
    switch (btntype) {
      case 'primary':
        return 'white';
      case 'warning':
        return 'white';
      case 'outline':
        return '#6D23F8';
      case 'outline-warning':
        return '#BA1B1B';
      default:
        return '#6D23F8';
    }
  };

  const getBtnBorder = () => {
    switch (btntype) {
      case 'primary':
        return undefined;
      case 'outline':
        return '1px solid #6D23F8';
      case 'outline-white':
        return '1px solid #6D23F8';
      case 'warning':
        return '1px solid #BA1B1B';
      case 'outline-warning':
        return '1px solid #BA1B1B';
      default:
        return undefined;
    }
  };

  const getBtnColorHover = () => {
    switch (btntype) {
      case 'primary':
        return '#6D23F8';
      case 'warning':
        return '#991919';
      default:
        return 'rgba(255,255,255,0.20)';
    }
  };

  const getBtnTextColorHover = () => {
    switch (btntype) {
      case 'primary':
        return 'white';
      case 'warning':
        return 'white';
      case 'outline-warning':
        return '#99191999';
      case 'outline':
        return '#6f25f799';
      default:
        return '#6D23F8';
    }
  };

  return (
    <Button
      bg={btntype ? getBtnColor() : '#6D23F8'}
      color={btntype ? getBtnTextColor() : 'white'}
      loadingText={label}
      fontWeight="600"
      borderRadius="8px"
      border={getBtnBorder()}
      letterSpacing={0.65}
      _loading={{
        background: '#4A181E !important',
        color: 'white !important',
        opacity: 0.5,
      }}
      _hover={btntype ? { background: getBtnColorHover(), color: getBtnTextColorHover() } : { background: '#8a56ea', color: 'white' }}
      {...otherProps}
    >
      {label}
    </Button>
  );
};
