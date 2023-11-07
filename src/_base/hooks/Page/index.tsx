import Head from 'next/head';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react';

import { EMPTY_ADMIN_DATA, IAdmin } from '@/_base/interfaces/admin';
import { validateSession } from '@/_base/services/auth';
import { PageWrapper } from '@/components/Page';
import { IPageContext, IPageProps } from './interfaces';

const PageContext = createContext<IPageContext>({
  admin: EMPTY_ADMIN_DATA,
  setAdmin: () => ({}),
  permissions: EMPTY_ADMIN_DATA.permissions,
});

export const Page: React.FC<PropsWithChildren<IPageProps>> = ({ admin: _admin, children, pageTitle, selectedPage }) => {
  const [admin, setAdmin] = useState<IAdmin>(_admin || EMPTY_ADMIN_DATA);

  const syncProfile = useCallback(async () => {
    try {
      const { response } = await validateSession();
      setAdmin(response);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (_admin) setAdmin(_admin);
    else syncProfile();
  }, [_admin]);

  return (
    <PageContext.Provider value={{ admin, setAdmin, permissions: admin.permission_group?.permissions || admin.permissions }}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <PageWrapper admin={admin} selectedPage={selectedPage}>
        {children}
      </PageWrapper>
    </PageContext.Provider>
  );
};

export const usePageContext = () => useContext(PageContext);
