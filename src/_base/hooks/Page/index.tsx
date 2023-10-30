import { Flex } from '@chakra-ui/react';
import Head from 'next/head';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react';

import { EMPTY_ADMIN_DATA, IAdmin } from '@/_base/interfaces/admin';
import { validateSession } from '@/_base/services/auth';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { IPageContext, IPageProps } from './interfaces';

const PageContext = createContext<IPageContext>({
  admin: EMPTY_ADMIN_DATA,
  setAdmin: () => ({}),
  permissions: EMPTY_ADMIN_DATA.permissions,
});

const NAKED_PAGES = ['login', 'recover_password'];

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
      <Flex h="100vh" w="100vw" flexDirection="column">
        {!selectedPage || NAKED_PAGES.includes(selectedPage) ? (
          children
        ) : (
          <>
            <Header admin={admin} />
            <Flex flex="1" padding="10px" gap="10px" bg="bg.gray" overflow="hidden">
              <Navbar page={selectedPage} admin={admin} />
              <Flex flex="1" height="100%" overflow="hidden">
                {children}
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </PageContext.Provider>
  );
};

export const usePageContext = () => useContext(PageContext);
