import { PropsWithChildren } from 'react';

import { IPageProps } from '@/_base/hooks/Page/interfaces';
import { Flex, Image, useColorMode } from '@chakra-ui/react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { GenericButton } from '../Buttons/Generic';

const NAKED_PAGES = ['login', 'signup', 'help', 'recover_password', 'store'];

export const PageWrapper: React.FC<PropsWithChildren<IPageProps>> = ({ selectedPage, user: admin, children }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex h="100vh" w="100vw" flexDirection="column" bg="primary50" position="relative" overflow="hidden" zIndex="0" bgImg={`/patterns/bg-${colorMode}.svg`} bgRepeat='no-repeat' bgSize='cover'>
      {!selectedPage || NAKED_PAGES.includes(selectedPage) ? (
        children
      ) : (
        <>
          <Header user={admin} />
          <Flex flex="1" padding="32px 112px" gap="32px" overflow="hidden">
            <Navbar page={selectedPage} user={admin} />
            <Flex flex="1" height="100%" overflow="hidden">
              {children}
            </Flex>
          </Flex>
        </>
      )}
      {/* Temporary Button */}
      <GenericButton
        position="absolute"
        left="50%"
        top="1rem"
        transform="translate(-50%, 0)"
        zIndex="10000"
        label={`Toggle ${colorMode === 'light' ? 'Dark' : 'Light'}`}
        onClick={toggleColorMode}
      />
    </Flex>
  );
};
