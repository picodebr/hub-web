import { Flex, Spinner } from '@chakra-ui/react';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';

import { ILoadingConfig, ILoadingContext, ILoadingProviderProps } from './interfaces';

const defaultConfig: ILoadingConfig = {
  isLoading: false,
  placement: 'default',
};

const LoadingContext = React.createContext<ILoadingContext>({
  loadingConfig: { ...defaultConfig },
  setLoadingConfig: () => ({}),
});

export const LoadingProvider: React.FC<PropsWithChildren<ILoadingProviderProps>> = ({ children, changeSignal }) => {
  const [loadingConfig, setLoadingConfig] = useState({ ...defaultConfig });

  useEffect(() => {
    setLoadingConfig({ ...defaultConfig });
  }, [changeSignal]);

  return (
    <LoadingContext.Provider value={{ loadingConfig, setLoadingConfig }}>
      {children}
      {loadingConfig.isLoading ? (
        <Flex
          position="fixed"
          bottom={loadingConfig.placement === 'center' ? '50%' : '3rem'}
          right={loadingConfig.placement === 'center' ? '50%' : '4rem'}
          zIndex="100"
          transform="scale(1.2)"
        >
          <Spinner size="xl" emptyColor="gray.200" thickness="6px" color="primary" speed="0.75s" />
        </Flex>
      ) : null}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
