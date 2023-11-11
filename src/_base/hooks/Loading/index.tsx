import { Flex, Spinner } from '@chakra-ui/react';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';

import { ILoadingConfig, ILoadingContext, ILoadingProviderProps } from './interfaces';

const defaultConfig: ILoadingConfig = {
  isLoading: false,
};

const LoadingContext = React.createContext<ILoadingContext>({
  loadingConfig: { ...defaultConfig },
  setLoadingConfig: () => ({}),
  runTransition: () => ({}),
});

export const LoadingProvider: React.FC<PropsWithChildren<ILoadingProviderProps>> = ({ children, changeSignal }) => {
  const [loadingConfig, setLoadingConfig] = useState({ ...defaultConfig });

  useEffect(() => {
    setLoadingConfig({ ...defaultConfig });
  }, [changeSignal]);

  const runTransition = (time = 500) => {
    setLoadingConfig({ isLoading: true });
    setTimeout(() => setLoadingConfig({ isLoading: false }), time);
  };

  return (
    <LoadingContext.Provider value={{ loadingConfig, setLoadingConfig, runTransition }}>
      <Flex
        position="fixed"
        overflow="hidden"
        width="100vw"
        height="100vh"
        zIndex="9999"
        bgGradient="linear(to-b, primary, gray.300)"
        transition="all 0.35s"
        opacity={loadingConfig.isLoading ? '1' : '0'}
        pointerEvents={loadingConfig.isLoading ? 'auto' : 'none'}
      >
        <Flex margin="auto" transition="all 0.65s" transform={loadingConfig.isLoading ? 'translateY(0) scale(1.5)' : 'translateY(80%) scale(0.5)'}>
          <Spinner size="xl" emptyColor="gray.900" thickness="6px" color="primary" speed="0.75s" />
        </Flex>
      </Flex>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
