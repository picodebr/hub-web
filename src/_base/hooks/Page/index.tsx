import Head from 'next/head';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react';

import { validateSession } from '@/_base/services/auth';
import { PageWrapper } from '@/components/Page';
import { IPageContext, IPageProps } from './interfaces';
import { EMPTY_HUB_USER, IHubUser } from '@/_base/interfaces/user';

const PageContext = createContext<IPageContext>({
  user: EMPTY_HUB_USER,
  setUser: (e) => ({ ...(e || ({} as any)) }),
  permissions: EMPTY_HUB_USER.permissions,
});

export const Page: React.FC<PropsWithChildren<IPageProps>> = ({ user: _admin, children, pageTitle, selectedPage }) => {
  const [user, setUser] = useState<IHubUser>(_admin || EMPTY_HUB_USER);

  const syncProfile = useCallback(async () => {
    try {
      const user = await validateSession();
      setUser(user);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (_admin) setUser(_admin);
    else syncProfile();
  }, [_admin]);

  return (
    <PageContext.Provider value={{ user: user, setUser: setUser, permissions: user.permissions }}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <PageWrapper user={user} selectedPage={selectedPage}>
        {children}
      </PageWrapper>
    </PageContext.Provider>
  );
};

export const usePageContext = () => useContext(PageContext);
