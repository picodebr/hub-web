import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
//@ts-ignore
import 'moment/locale/pt-br';
//@ts-ignore
import '../styles/globals.css';

import { api } from '@/_base/classes/api';
import { CustomRouterProvider } from '@/_base/hooks/CustomRouter';
import { LoadingProvider, useLoading } from '@/_base/hooks/Loading';
import { Page } from '@/_base/hooks/Page';
import { cookieManager } from '@/_base/utils';
import { globalTheme } from '@/styles/global';
import { StyledGlobal } from '@/styles/StyledGlobal';
import { BlocklyProvider, PlatformProvider } from '@/_base/hooks';
import { ThemeProvider } from 'styled-components';
import { themes } from '@/styles/themes';
import { CombinedProviders } from '@/_base/context/CombinedProviders';

export default function App({ Component, pageProps }: AppProps) {
  const token = cookieManager.getToken();
  api.defaults.headers.authorization = `Bearer ${token}`;

  const { setLoadingConfig } = useLoading();

  return (
    <ThemeProvider theme={themes.light}>
      <ChakraProvider theme={globalTheme}>
        <PlatformProvider>
          <StyledGlobal />
          <LoadingProvider changeSignal={{}}>
            <CustomRouterProvider>
              <CombinedProviders>
                <BlocklyProvider>
                  <Page {...pageProps} setLoadingConfig={setLoadingConfig}>
                    <Component {...pageProps} />
                    <CSSReset />
                  </Page>
                </BlocklyProvider>
              </CombinedProviders>
            </CustomRouterProvider>
          </LoadingProvider>
        </PlatformProvider>
      </ChakraProvider>
    </ThemeProvider>
  );
}
