import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import type { AppProps } from 'next/app';

import { api } from '@/_base/classes/api';
import { CustomRouterProvider } from '@/_base/hooks/CustomRouter';
import { LoadingProvider } from '@/_base/hooks/Loading';
import { Page } from '@/_base/hooks/Page';
import { tokenManager } from '@/_base/utils';
import { globalTheme } from '@/styles/global';

export default function App({ Component, pageProps }: AppProps) {
  const token = tokenManager.getToken();
  api.defaults.headers.authorization = `Bearer ${token}`;

  return (
    <ChakraProvider theme={globalTheme}>
      <LoadingProvider changeSignal={{}}>
        <CustomRouterProvider>
          <Page {...pageProps}>
            <Component {...pageProps} />
            <CSSReset />
          </Page>
        </CustomRouterProvider>
      </LoadingProvider>
    </ChakraProvider>
  );
}
