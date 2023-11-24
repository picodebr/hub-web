import { UseToastOptions, useToast } from '@chakra-ui/react';

const toastConfig = {
  duration: 5000,
  isClosable: true,
};

export const useCustomToast = (options: UseToastOptions = {}) =>
  useToast({
    ...toastConfig,
    ...options,
    colorScheme: 'green',
    variant: 'subtle',
    containerStyle: { bg: 'primary900', color: 'white', borderRadius: 'md' },
  });
