import Head from 'next/head';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect } from 'react';

import { validateSession } from '@/_base/services/auth';
import { PageWrapper } from '@/components/Page';
import { IPageProps } from './interfaces';
import { useAuth } from '../Auth';
import { Tour } from 'antd';
import { useHubTour } from '../HubTour';

const PageContext = createContext({});
export const usePageContext = () => useContext(PageContext);

export const Page: React.FC<PropsWithChildren<IPageProps>> = ({ children, pageTitle, selectedPage, showBackButton, headerLabel, user: _user }) => {
  const { setUser } = useAuth();
  const { isOpen, steps, stopTour, navbar } = useHubTour();

  const syncProfile = useCallback(async () => {
    try {
      const sessionData = await validateSession();
      setUser(sessionData);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (_user) setUser(_user);
    else syncProfile();
  }, []);

  return (
    <PageContext.Provider value={{}}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <PageWrapper
        user={_user}
        selectedPage={selectedPage}
        showBackButton={showBackButton}
        headerLabel={headerLabel}
        isOpen={navbar.isOpen}
        stopTour={navbar.stopTour}
      >
        {children}
      </PageWrapper>
      <Tour open={isOpen} onClose={() => stopTour()} steps={steps} />
    </PageContext.Provider>
  );
};
