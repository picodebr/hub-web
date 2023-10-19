import { UseToastOptions } from '@chakra-ui/react';

export const showErrorToClient = (error: any, toast: (data: UseToastOptions) => void) => {
  const message: string =
    error?.response?.data?.response?.message ||
    error?.response?.data?.message ||
    error?.response?.message ||
    error?.message ||
    'Unknown Service: Error Occurred';

  toast({
    status: 'error',
    title: String(message)?.split(':')?.slice(1)?.toString() || String(message) || 'Error Occurred',
  });
};
