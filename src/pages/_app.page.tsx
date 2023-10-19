import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import type { AppProps } from 'next/app';

import { api } from '@/_base/classes/api';
import { CustomRouterProvider } from '@/_base/hooks/CustomRouter';
import { LoadingProvider } from '@/_base/hooks/Loading';
import { Page } from '@/_base/hooks/Page';
import { globalTheme } from '@/styles/global';
import { useCookies } from 'react-cookie';

export default function App({ Component, pageProps }: AppProps) {
  //Setting header authorization on every page load
  const [cookies] = useCookies(['adhow_access']);
  // api.defaults.headers.authorization = `Bearer ${cookies.adhow_access}`;

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
