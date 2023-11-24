import { PropsWithChildren, useContext, useEffect, useState, createContext } from 'react';
import { Flex, Image } from '@chakra-ui/react';

import { ILoadingConfig, ILoadingContext, ILoadingProviderProps } from './interfaces';

const defaultConfig: ILoadingConfig = { isLoading: false };

const LoadingContext = createContext<ILoadingContext>({
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
        bg="primary100"
        transition="all 0.35s"
        opacity={loadingConfig.isLoading ? '1' : '0'}
        pointerEvents={loadingConfig.isLoading ? 'auto' : 'none'}
      >
        <Image src="/loading/happy-loading.gif" zIndex="-1" h="500px" position="fixed" left="50%" top="50%" transform="translate(-50%, -50%)" />
        <Image src="/patterns/line-pattern.svg" zIndex="-1" h={{ base: '0', lg: '445px' }} position="absolute" left="0" top="11.5rem" />
        <Image src="/patterns/line-pattern.svg" zIndex="-1" h={{ base: '0', lg: '445px' }} position="absolute" bottom="0" right="-5rem" />
      </Flex>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
